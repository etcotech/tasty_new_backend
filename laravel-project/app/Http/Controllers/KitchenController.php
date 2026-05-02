<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Traits\HasOrderWebhooks;

class KitchenController extends Controller
{
    use HasOrderWebhooks;

    public function dashboard()
    {
        $restaurant = $this->getCurrentRestaurant();
        
        if (auth()->user()->role !== 'super_admin') {
            if (!$restaurant) return redirect()->route('admin.dashboard');
            
            $plan = $restaurant->subscription?->plan;
            if (!$plan || !$plan->has_kds) {
                return Inertia::render('Error', [
                    'message' => 'شاشة المطبخ غير متاحة في باقتك الحالية',
                    'title' => 'تحتاج إلى ترقية الباقة'
                ]);
            }
        }

        return Inertia::render('Kitchen/Dashboard');
    }

    public function index(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        
        if (!$restaurant) {
            $user = auth()->user();
            $message = 'No restaurant selected. Please select a restaurant from management first.';
            
            if ($user && $user->role === 'restaurant_admin' && !$user->restaurant_id) {
                $message = 'Account Error: Restaurant admin has no restaurant assigned. Please contact support.';
            }

            return response()->json([
                'success' => false, 
                'message' => $message,
                'orders' => [],
                'branches' => []
            ]);
        }

        $branchId = $request->query('branch_id');
        
        $query = Order::where('restaurant_id', $restaurant->id)
            ->with(['items.addons', 'branch'])
            ->whereIn('status', ['pending', 'preparing', 'ready'])
            ->orderBy('created_at', 'asc');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $orders = $query->get();
        $branches = $restaurant->branches()->where('is_active', true)->get(['id', 'name_ar', 'name_en']);
            
        return response()->json([
            'success' => true,
            'orders' => $orders,
            'restaurant' => $restaurant,
            'branches' => $branches
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,preparing,ready,completed'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Invalid status'], 422);
        }

        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        // Optional: verify order belongs to current restaurant
        $restaurant = $this->getCurrentRestaurant();
        if ($restaurant && $order->restaurant_id !== $restaurant->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $oldStatus = $order->status;
        $order->status = $request->status;
        $order->save();

        // Trigger n8n review webhook if status changed to completed
        if ($request->status === 'completed' && $oldStatus !== 'completed') {
            \Illuminate\Support\Facades\Log::info("Order completed webhook attempted", [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'old_status' => $oldStatus,
                'new_status' => $request->status
            ]);
            $this->sendOrderCompletedWebhook($order);
        }

        return response()->json(['success' => true, 'message' => 'Status updated', 'order' => $order]);
    }
}
