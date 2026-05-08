<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PaymentLog;

class PaymentReportController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if ($user->role === 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        $query = PaymentLog::where('restaurant_id', $user->restaurant_id)
            ->whereIn('payment_method', ['paymob_online', 'paymob'])
            ->with(['order', 'branch'])
            ->latest();

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $logs = $query->get();

        $stats = [
            'total_amount' => $logs->where('payment_status', 'paid')->sum('amount'),
            'total_transactions' => $logs->count(),
            'failed_transactions' => $logs->where('payment_status', 'failed')->count(),
            'pending_transactions' => $logs->where('payment_status', 'pending')->count(),
        ];

        return Inertia::render('Admin/PaymentReports/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'branches' => \App\Models\Branch::where('restaurant_id', $user->restaurant_id)->get(),
            'filters' => $request->only(['date_from', 'date_to', 'branch_id'])
        ]);
    }
}
