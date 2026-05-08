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
        Log::info('Paymob Callback Received', $request->all());

        $success = $request->query('success') === 'true';
        $txnId = $request->query('id');
        $merchantOrderId = $request->query('merchant_order_id');

        $order = Order::find($merchantOrderId);
        if (!$order) {
            Log::error('Order not found for Paymob callback', ['merchant_order_id' => $merchantOrderId]);
            return redirect('/')->with('error', 'Order not found');
        }

        if ($success) {
            if ($order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'pending',
                    'paymob_transaction_id' => $txnId
                ]);

                $this->triggerPostPaymentActions($order);
            }
            // For storefront, we might want to redirect to a success page or the tracking page
            return redirect("/track/{$order->order_number}")->with('success', 'Payment successful');
        } else {
            if ($order->payment_status !== 'paid') {
                $order->update([
                    'payment_status' => 'failed'
                ]);
            }
            return redirect("/track/{$order->order_number}")->with('error', 'Payment failed');
        }
    }

    public function paymobWebhook(Request $request)
    {
        Log::info('Paymob Webhook Received', $request->all());
        
        $data = $request->all();
        $obj = data_get($data, 'obj');
        if (!$obj) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $merchantOrderId = data_get($obj, 'order.merchant_order_id');
        $txnId = data_get($obj, 'id');
        $success = data_get($obj, 'success') === true;

        $order = Order::find($merchantOrderId);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // HMAC Verification (Optional but recommended)
        $hmac = $request->query('hmac');
        $gateway = $order->restaurant->paymentGateway;
        
        if ($gateway && $gateway->paymob_hmac_secret && $hmac) {
            if (!$this->verifyPaymobHmac($data, $gateway->paymob_hmac_secret, $hmac)) {
                Log::error('Paymob HMAC verification failed', ['order_id' => $merchantOrderId]);
                return response()->json(['message' => 'Invalid HMAC'], 401);
            }
        }

        if ($success && $order->payment_status !== 'paid') {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'pending',
                'paymob_transaction_id' => $txnId
            ]);

            $this->triggerPostPaymentActions($order);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function triggerPostPaymentActions(Order $order)
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
}
