<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentLog;

class OrderPaymentService
{
    public static function markPaymobOrderAsPaid(Order $order, array $paymobData)
    {
        if ($order->payment_status === 'paid') {
            return;
        }

        $txnId = $paymobData['transaction_id'] ?? null;
        $paymobOrderId = $paymobData['order_id'] ?? null;

        $order->update([
            'payment_status' => 'paid',
            'status' => 'pending',
            'paid_at' => now(),
            'paymob_transaction_id' => $txnId ?: $order->paymob_transaction_id,
            'paymob_order_id' => $paymobOrderId ?: $order->paymob_order_id,
        ]);

        PaymentLog::firstOrCreate([
            'order_id' => $order->id,
            'payment_method' => 'paymob_online',
            'payment_status' => 'paid',
            'provider_transaction_id' => $txnId ?: $order->paymob_transaction_id
        ], [
            'restaurant_id' => $order->restaurant_id,
            'branch_id' => $order->branch_id,
            'amount' => $order->total,
            'currency' => $order->restaurant->currency ?? 'SAR',
            'provider_order_id' => $paymobOrderId ?: $order->paymob_order_id,
        ]);

        // Trigger post payment actions
        app(\App\Http\Controllers\PaymentCallbackController::class)->triggerPostPaymentActions($order);
    }
}
