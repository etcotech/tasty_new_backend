<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Restaurant;
use App\Models\Order;
use App\Models\AiCampaign;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Admin\AiAutomationController;

class GenerateSmartCampaigns extends Command
{
    protected $signature = 'ai:generate-smart-campaigns';
    protected $description = 'Analyze customers daily and generate smart campaign suggestions';

    public function handle()
    {
        $restaurants = Restaurant::all();
        $controller = app(AiAutomationController::class);

        foreach ($restaurants as $restaurant) {
            // Check if there are active customers to warrant a suggestion
            $hasCustomers = \App\Models\RestaurantCustomer::where('restaurant_id', $restaurant->id)
                ->whereNotNull('phone')
                ->where('phone', '!=', '')
                ->exists();

            if (!$hasCustomers) continue;

            // Generate suggestion using the logic from AiAutomationController
            $now = Carbon::now();
            $last14Days = $now->copy()->subDays(14);

            $topProducts = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.restaurant_id', $restaurant->id)
                ->where('orders.created_at', '>=', $last14Days)
                ->select('product_name_ar', DB::raw('SUM(quantity) as total_qty'))
                ->groupBy('product_name_ar')
                ->orderByDesc('total_qty')
                ->limit(5)
                ->get();

            // We need a way to get the slowest segment
            // Let's copy the logic or invoke it via reflection/public method
            // Since getSlowestSegment is private in the controller, let's just duplicate the basic logic here for simplicity
            $minSegment = $this->getSlowestSegment($restaurant->id, $last14Days);

            $inputSummary = [
                'top_products' => $topProducts->pluck('product_name_ar')->toArray(),
                'slowest_period' => $minSegment,
                'total_orders_14d' => Order::where('restaurant_id', $restaurant->id)->where('created_at', '>=', $last14Days)->count()
            ];

            // Use reflection to call the private generateSuggestion method
            $reflection = new \ReflectionClass(AiAutomationController::class);
            $method = $reflection->getMethod('generateSuggestion');
            $method->setAccessible(true);
            
            $suggestionData = $method->invoke($controller, $inputSummary);

            if (!is_array($suggestionData)) continue;

            // Target Audience Logic
            $autoTargetAudience = 'all';
            $targetCount = 0;

            $inactive30Count = \App\Models\RestaurantCustomer::where('restaurant_id', $restaurant->id)
                ->whereNotNull('phone')
                ->where('phone', '!=', '')
                ->where('last_order_at', '<', Carbon::now()->subDays(30))
                ->count();

            if ($inactive30Count > 0) {
                $autoTargetAudience = 'inactive_30';
                $targetCount = $inactive30Count;
            } else {
                $inactive7Count = \App\Models\RestaurantCustomer::where('restaurant_id', $restaurant->id)
                    ->whereNotNull('phone')
                    ->where('phone', '!=', '')
                    ->where('last_order_at', '<', Carbon::now()->subDays(7))
                    ->count();
                if ($inactive7Count > 0) {
                    $autoTargetAudience = 'inactive_7';
                    $targetCount = $inactive7Count;
                } else {
                    $repeatCount = \App\Models\RestaurantCustomer::where('restaurant_id', $restaurant->id)
                        ->whereNotNull('phone')
                        ->where('phone', '!=', '')
                        ->where('orders_count', '>', 1)
                        ->count();
                    if ($repeatCount > 0) {
                        $autoTargetAudience = 'repeat';
                        $targetCount = $repeatCount;
                    } else {
                        $targetCount = \App\Models\RestaurantCustomer::where('restaurant_id', $restaurant->id)
                            ->whereNotNull('phone')
                            ->where('phone', '!=', '')
                            ->count();
                    }
                }
            }

            // Save suggestion as a campaign with status 'suggested'
            AiCampaign::create([
                'restaurant_id' => $restaurant->id,
                'title' => $suggestionData['offer_title'] ?? 'عرض السعادة الذكي',
                'message' => $suggestionData['offer_message'] ?? '',
                'target_audience' => $autoTargetAudience,
                'target_count' => $targetCount,
                'suggested_time_window' => $suggestionData['suggested_time_window'] ?? '',
                'reason' => $suggestionData['target_reason'] ?? '',
                'status' => 'suggested',
                'created_by' => null, // System generated
            ]);

            $this->info("Generated suggestion for restaurant: {$restaurant->id}");
        }
    }

    private function getSlowestSegment($restaurantId, $startDate)
    {
        $hourlySales = Order::where('restaurant_id', $restaurantId)
            ->where('created_at', '>=', $startDate)
            ->select(DB::raw("strftime('%H', created_at) as hour"), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->get();

        if ($hourlySales->isEmpty()) return null;

        $segments = [
            'صباحاً' => 0,
            'ظهراً' => 0,
            'مساءً' => 0,
            'ليلاً' => 0
        ];

        foreach ($hourlySales as $sale) {
            $h = (int)$sale->hour;
            if ($h >= 6 && $h < 12) {
                $segments['صباحاً'] += $sale->count;
            } elseif ($h >= 12 && $h < 16) {
                $segments['ظهراً'] += $sale->count;
            } elseif ($h >= 16 && $h < 20) {
                $segments['مساءً'] += $sale->count;
            } else {
                $segments['ليلاً'] += $sale->count;
            }
        }

        $minSegment = null;
        $minCount = PHP_INT_MAX;

        foreach ($segments as $name => $count) {
            if ($count < $minCount) {
                $minCount = $count;
                $minSegment = $name;
            }
        }

        return $minSegment;
    }
}
