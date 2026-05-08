<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Log;
use App\Traits\HasOrderWebhooks;
use App\Traits\HasLoyaltyRewards;
use App\Traits\HasPosSync;
use App\Traits\HasCustomerSync;

class PaymentCallbackController extends Controller
{
    use HasOrderWebhooks, HasLoyaltyRewards, HasPosSync, HasCustomerSync;

    public function paymobCallback(Request $request)
    {
        Log::info('Paymob Callback Received', [
            'success' => $request->query('success'),
            'pending' => $request->query('pending'),
            'id' => $request->query('id'),
            'order' => $request->query('order'),
            'merchant_order_id' => $request->query('merchant_order_id'),
            'amount_cents' => $request->query('amount_cents'),
        ]);

        $success = $request->query('success') === 'true';
        $pending = $request->query('pending') === 'true';
        $txnId = $request->query('id');
        $merchantOrderId = $request->query('merchant_order_id');
        $paymobOrderId = $request->query('order');

        $order = Order::where(function($q) use ($paymobOrderId, $txnId, $merchantOrderId) {
            if ($paymobOrderId) $q->orWhere('paymob_order_id', $paymobOrderId);
            if ($txnId) $q->orWhere('paymob_transaction_id', $txnId);
            if ($merchantOrderId) {
                $q->orWhere('payment_reference', $merchantOrderId)
                  ->orWhere('order_number', $merchantOrderId)
                  ->orWhere('id', $merchantOrderId);
            }
        })->first();

        if (!$order) {
            Log::error('Order not found for Paymob callback', [
                'merchant_order_id' => $merchantOrderId,
                'paymob_order_id' => $paymobOrderId,
                'txn_id' => $txnId
            ]);
            return redirect('/')->with('error', 'الطلب غير موجود');
        }

        Log::info('Matched Local Order in Callback', ['order_id' => $order->id, 'order_number' => $order->order_number]);

        if ($success && !$pending) {
            $hmac = $request->query('hmac');
            $gateway = $order->restaurant->paymentGateway;

            if ($hmac && $gateway && $gateway->paymob_hmac_secret) {
                if (!$this->verifyCallbackHmac($request, $gateway->paymob_hmac_secret, $hmac)) {
                    Log::error('Paymob Callback HMAC failed', [
                        'order_id' => $order->id,
                        'expected_hmac_provided' => $hmac
                    ]);
                    return redirect('/')->with('error', 'فشل التحقق من صحة البيانات (HMAC)');
                }
            }

            \App\Services\OrderPaymentService::markPaymobOrderAsPaid($order, [
                'transaction_id' => $txnId,
                'order_id' => $paymobOrderId
            ]);
            return redirect("/track/{$order->order_number}")->with('success', 'تم الدفع بنجاح');
        } else {
            if ($order->payment_status !== 'paid' && !$pending) {
                $order->update([
                    'payment_status' => 'failed',
                    'status' => 'payment_failed'
                ]);
            }
            return redirect("/track/{$order->order_number}")->with('error', 'فشل الدفع، يمكنك المحاولة مرة أخرى');
        }
    }

    public function paymobWebhook(Request $request)
    {
        Log::info('Paymob Webhook Received', [
            'obj_id' => data_get($request->all(), 'obj.id'),
            'obj_order_id' => data_get($request->all(), 'obj.order.id'),
            'merchant_order_id' => data_get($request->all(), 'obj.order.merchant_order_id'),
            'success' => data_get($request->all(), 'obj.success'),
            'pending' => data_get($request->all(), 'obj.pending'),
            'amount_cents' => data_get($request->all(), 'obj.amount_cents'),
        ]);
        
        $data = $request->all();
        $obj = data_get($data, 'obj');
        if (!$obj) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $merchantOrderId = data_get($obj, 'order.merchant_order_id');
        $paymobOrderId = data_get($obj, 'order.id');
        $txnId = data_get($obj, 'id');
        $success = data_get($obj, 'success') === true;
        $pending = data_get($obj, 'pending') === true;

        $order = Order::where(function($q) use ($paymobOrderId, $txnId, $merchantOrderId) {
            if ($paymobOrderId) $q->orWhere('paymob_order_id', $paymobOrderId);
            if ($txnId) $q->orWhere('paymob_transaction_id', $txnId);
            if ($merchantOrderId) {
                $q->orWhere('payment_reference', $merchantOrderId)
                  ->orWhere('order_number', $merchantOrderId)
                  ->orWhere('id', $merchantOrderId);
            }
        })->first();

        if (!$order) {
            Log::error('Order not found for Paymob webhook', [
                'merchant_order_id' => $merchantOrderId,
                'paymob_order_id' => $paymobOrderId,
                'txn_id' => $txnId
            ]);
            return response()->json(['message' => 'Order not found'], 404);
        }

        Log::info('Matched Local Order in Webhook', ['order_id' => $order->id, 'order_number' => $order->order_number]);

        // HMAC Verification (Optional but recommended)
        $hmac = $request->query('hmac');
        $gateway = $order->restaurant->paymentGateway;
        
        if ($gateway && $gateway->paymob_hmac_secret && $hmac) {
            if (!$this->verifyPaymobHmac($data, $gateway->paymob_hmac_secret, $hmac)) {
                Log::error('Paymob HMAC failed, order not updated', [
                    'order_id' => $order->id,
                    'expected_hmac_provided' => $hmac
                ]);
                return response()->json(['message' => 'Invalid HMAC'], 401);
            }
        }

        if ($success && !$pending) {
            \App\Services\OrderPaymentService::markPaymobOrderAsPaid($order, [
                'transaction_id' => $txnId,
                'order_id' => $paymobOrderId
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function triggerPostPaymentActions(Order $order)
    {
        // Refresh order to get latest status and relations
        $order->refresh();

        $this->applyWalletRedemption($order);
        $this->syncRestaurantCustomer($order);
        $this->syncOrderToPos($order);
        $this->sendOrderCreatedWebhook($order);
        $this->sendOrderInvoiceWebhook($order);
    }

    protected function verifyPaymobHmac($data, $secret, $hmac)
    {
        $obj = $data['obj'];
        $fields = [
            'amount_cents',
            'created_at',
            'currency',
            'error_occured',
            'has_parent_transaction',
            'id',
            'integration_id',
            'is_3d_secure',
            'is_auth',
            'is_capture',
            'is_refunded',
            'is_standalone_payment',
            'is_voided',
            'order.id', // Using dot notation for data_get
            'owner',
            'pending',
            'source_data.pan',
            'source_data.sub_type',
            'source_data.type',
            'success',
        ];

        $concatenatedString = '';
        foreach ($fields as $field) {
            $value = data_get($obj, $field);
            if (is_bool($value)) {
                $concatenatedString .= $value ? 'true' : 'false';
            } else {
                $concatenatedString .= $value;
            }
        }

        $calculatedHmac = hash_hmac('sha512', $concatenatedString, $secret);
        return hash_equals($calculatedHmac, $hmac);
    }

    protected function verifyCallbackHmac(Request $request, $secret, $hmac)
    {
        $fields = [
            'amount_cents',
            'created_at',
            'currency',
            'error_occured',
            'has_parent_transaction',
            'id',
            'integration_id',
            'is_3d_secure',
            'is_auth',
            'is_capture',
            'is_refunded',
            'is_standalone_payment',
            'is_voided',
            'order',
            'owner',
            'pending',
            'source_data.pan',
            'source_data.sub_type',
            'source_data.type',
            'success',
        ];

        $concatenatedString = '';
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $concatenatedString .= $request->query($field);
            }
        }

        $calculatedHmac = hash_hmac('sha512', $concatenatedString, $secret);
        return hash_equals($calculatedHmac, $hmac);
    }
}
