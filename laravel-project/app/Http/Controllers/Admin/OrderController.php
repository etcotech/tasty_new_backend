<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['restaurant', 'items.addons'])->latest()->get();
        return Inertia::render('Admin/Orders', [
            'orders' => $orders
        ]);
    }
}
