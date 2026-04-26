<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;

class KitchenController extends Controller
{
    public function index()
    {
        $restaurant = \App\Models\Restaurant::first();
        if (!$restaurant) {
            return response()->json(['success' => false, 'message' => 'Restaurant not found'], 404);
        }

        $orders = Order::where('restaurant_id', $restaurant->id)
            ->with(['items.addons'])
            ->where('status', '!=', 'completed')
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'orders' => $orders,
            'restaurant' => $restaurant
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

        $order->status = $request->status;
        $order->save();

        return response()->json(['success' => true, 'message' => 'Status updated', 'order' => $order]);
    }
}
