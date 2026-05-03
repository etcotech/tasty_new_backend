<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\AiAutomationLog;
use App\Models\Restaurant;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AiAutomationController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return redirect()->route('admin.dashboard');

        $now = Carbon::now();
        $startOfWeek = $now->copy()->startOfWeek();

        // A. ملخص ذكي للمبيعات
        $weeklyOrdersCount = Order::where('restaurant_id', $restaurant->id)
            ->where('created_at', '>=', $startOfWeek)
            ->count();

        $weeklyRevenue = Order::where('restaurant_id', $restaurant->id)
            ->where('created_at', '>=', $startOfWeek)
            ->whereIn('status', ['completed', 'delivered'])
            ->sum('total');

        $topSellingItem = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->where('orders.created_at', '>=', $now->copy()->subDays(30))
            ->select('product_name_ar', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_name_ar')
            ->orderByDesc('total_qty')
            ->first();

        // Slowest sales period (by hour)
        $hourlySales = Order::where('restaurant_id', $restaurant->id)
            ->where('created_at', '>=', $now->copy()->subDays(14))
            ->select(DB::raw("strftime('%H', created_at) as hour"), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'asc')
            ->get();
        
        $slowestHour = $hourlySales->first();
        $slowestPeriodText = $slowestHour ? ($slowestHour->hour . ":00 - " . ($slowestHour->hour + 1) . ":00") : 'لا يوجد بيانات كافية';

        // Returning customers count (by phone)
        $returningCustomers = Order::where('restaurant_id', $restaurant->id)
            ->select('phone', DB::raw('COUNT(*) as orders_count'))
            ->groupBy('phone')
            ->having('orders_count', '>', 1)
            ->get()
            ->count();

        $stats = [
            'weeklyOrdersCount' => $weeklyOrdersCount,
            'weeklyRevenue' => round($weeklyRevenue, 2),
            'topSellingItem' => $topSellingItem ? $topSellingItem->product_name_ar : 'غير متوفر',
            'slowestPeriod' => $slowestPeriodText,
            'returningCustomers' => $returningCustomers
        ];

        $recentLogs = AiAutomationLog::where('restaurant_id', $restaurant->id)
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Admin/AIAutomation', [
            'stats' => $stats,
            'recentLogs' => $recentLogs
        ]);
    }

    public function suggestOffer()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $now = Carbon::now();
        $last14Days = $now->copy()->subDays(14);

        // Fetch data for AI analysis
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->where('orders.created_at', '>=', $last14Days)
            ->select('product_name_ar', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_name_ar')
            ->orderByDesc('total_qty')
            ->limit(3)
            ->get();

        $hourlySales = Order::where('restaurant_id', $restaurant->id)
            ->where('created_at', '>=', $last14Days)
            ->select(DB::raw("strftime('%H', created_at) as hour"), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'asc')
            ->get();

        $slowestHour = $hourlySales->first();
        
        $inputSummary = [
            'top_products' => $topProducts->pluck('product_name_ar')->toArray(),
            'slowest_hour' => $slowestHour ? $slowestHour->hour : null,
            'total_orders_14d' => Order::where('restaurant_id', $restaurant->id)->where('created_at', '>=', $last14Days)->count()
        ];

        $suggestion = $this->generateSuggestion($inputSummary);

        // Log the suggestion
        AiAutomationLog::create([
            'restaurant_id' => $restaurant->id,
            'type' => 'offer_suggestion',
            'input_summary' => $inputSummary,
            'output_text' => $suggestion
        ]);

        return response()->json([
            'success' => true,
            'suggestion' => $suggestion
        ]);
    }

    private function generateSuggestion($data)
    {
        $apiKey = config('services.openai.key');

        if ($apiKey) {
            try {
                $topProductsText = implode(', ', $data['top_products']);
                $slowHour = $data['slowest_hour'] !== null ? ($data['slowest_hour'] . ":00") : "فترات الركود";

                $prompt = "أنت مساعد ذكاء اصطناعي متخصص في التسويق للمطاعم.
                بناءً على البيانات التالية لمطعم:
                - المنتجات الأكثر مبيعاً: {$topProductsText}
                - أبطأ ساعة في المبيعات: {$slowHour}
                - عدد الطلبات في آخر 14 يوم: {$data['total_orders_14d']}
                
                اقترح عرضاً ترويجياً واحداً (Offer) باللغة العربية لجذب العملاء في فترات الركود. 
                اجعل الرسالة قصيرة وجذابة وملهمة.";

                $response = Http::withToken($apiKey)->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [
                        ['role' => 'system', 'content' => 'أنت خبير تسويق مطاعم.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 200,
                ]);

                if ($response->successful()) {
                    return $response->json()['choices'][0]['message']['content'];
                }
                
                Log::error('OpenAI API Error: ' . $response->body());
            } catch (\Exception $e) {
                Log::error('OpenAI Exception: ' . $e->getMessage());
            }
        }

        // Fallback deterministic suggestion
        $product = !empty($data['top_products']) ? $data['top_products'][0] : 'وجباتنا المميزة';
        $hour = $data['slowest_hour'] !== null ? $data['slowest_hour'] : 4;
        $period = ($hour < 12) ? 'صباحاً' : 'مساءً';
        $displayHour = ($hour > 12) ? ($hour - 12) : ($hour == 0 ? 12 : $hour);

        return "بناءً على تحليلاتنا، نقترح تقديم عرض 'كومبو السعادة' على {$product} في الفترة بين {$displayHour} و " . (($displayHour % 12) + 2) . " {$period} لزيادة المبيعات في هذا الوقت الهادئ.";
    }
}
