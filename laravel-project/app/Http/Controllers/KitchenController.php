<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;

class KitchenController extends Controller
{
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

        $order->status = $request->status;
        $order->save();

        return response()->json(['success' => true, 'message' => 'Status updated', 'order' => $order]);
    }
}
