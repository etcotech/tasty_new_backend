<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymobService
{
    /**
     * Get the base URL based on currency
     */
    protected function getBaseUrl($currency = 'SAR')
    {
        if ($currency === 'SAR') {
            return config('services.paymob.base_url_ksa', 'https://ksa.paymob.com/api');
        }
        return config('services.paymob.base_url_egypt', 'https://accept.paymob.com/api');
    }

    /**
     * LEGACY FLOW: Authenticate and get token
     */
    public function authenticate($apiKey, $currency = 'SAR')
    {
        if (empty($apiKey)) {
            throw new \Exception('إعدادات Paymob غير مكتملة (API Key مفقود)');
        }

        try {
            $baseUrl = $this->getBaseUrl($currency);
            $response = Http::post("{$baseUrl}/auth/tokens", [
                'api_key' => $apiKey
            ]);

            if (!$response->successful()) {
                Log::error('Paymob Auth Failed', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                throw new \Exception('فشل الاتصال ببوابة Paymob (خطأ في المصادقة)');
            }

            return $response->json()['token'] ?? null;
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'بوابة Paymob')) throw $e;
            throw new \Exception('فشل الاتصال ببوابة Paymob: ' . $e->getMessage());
        }
    }

    /**
     * LEGACY FLOW: Create Order
     */
    public function createOrder($token, $amountCents, $merchantOrderId, $currency = 'SAR')
    {
        try {
            $baseUrl = $this->getBaseUrl($currency);
            $response = Http::post("{$baseUrl}/ecommerce/orders", [
                'auth_token' => $token,
                'delivery_needed' => 'false',
                'amount_cents' => (int)$amountCents,
                'currency' => $currency,
                'merchant_order_id' => (string)$merchantOrderId,
                'items' => []
            ]);

            if (!$response->successful()) {
                Log::error('Paymob Order Creation Failed', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                
                $data = $response->json();
                if (isset($data['message']) && str_contains($data['message'], 'currency')) {
                    throw new \Exception('العملة غير مدعومة في حساب Paymob الخاص بك');
                }
                
                throw new \Exception('فشل إنشاء طلب الدفع في Paymob');
            }

            return $response->json();
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'Paymob') || str_contains($e->getMessage(), 'العملة')) throw $e;
            throw new \Exception('فشل إنشاء طلب الدفع في Paymob: ' . $e->getMessage());
        }
    }

    /**
     * LEGACY FLOW: Get Payment Key
     */
    public function getPaymentKey($token, $orderId, $amountCents, $integrationId, $currency = 'SAR', $billingData = [])
    {
        if (empty($integrationId)) {
            throw new \Exception('إعدادات Paymob غير مكتملة (Integration ID مفقود)');
        }

        try {
            $baseUrl = $this->getBaseUrl($currency);
            $response = Http::post("{$baseUrl}/acceptance/payment_keys", [
                'auth_token' => $token,
                'amount_cents' => (int)$amountCents,
                'expiration' => 3600,
                'order_id' => $orderId,
                'billing_data' => array_merge([
                    'first_name' => 'NA',
                    'last_name' => 'NA',
                    'email' => 'NA@tasty.com',
                    'phone_number' => 'NA',
                    'apartment' => 'NA',
                    'floor' => 'NA',
                    'street' => 'NA',
                    'building' => 'NA',
                    'shipping_method' => 'NA',
                    'postal_code' => 'NA',
                    'city' => 'NA',
                    'country' => 'NA',
                    'state' => 'NA',
                ], $billingData),
                'currency' => $currency,
                'integration_id' => (int)$integrationId,
            ]);

            if (!$response->successful()) {
                Log::error('Paymob Payment Key Failed', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                
                $data = $response->json();
                if (isset($data['message']) && str_contains($data['message'], 'integration')) {
                    throw new \Exception('Integration ID غير صحيح أو غير مفعل');
                }

                throw new \Exception('فشل إنشاء payment key');
            }

            return $response->json()['token'] ?? null;
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'payment key') || str_contains($e->getMessage(), 'Integration')) throw $e;
            throw new \Exception('فشل إنشاء payment key: ' . $e->getMessage());
        }
    }

    /**
     * NEW INTENTION FLOW (Unified Checkout)
     */
    public function createPaymentIntention($secretKey, $amountCents, $currency, $integrationId, $billingData, $extras = [])
    {
        if (empty($secretKey)) {
            throw new \Exception('إعدادات Paymob غير مكتملة (Secret Key مفقود)');
        }

        try {
            $baseUrl = $this->getBaseUrl($currency);
            $response = Http::withHeaders([
                'Authorization' => "Token {$secretKey}",
                'Content-Type' => 'application/json'
            ])->post("{$baseUrl}/intention/", [
                'amount' => (int)$amountCents,
                'currency' => $currency,
                'payment_methods' => [(int)$integrationId],
                'items' => $extras['items'] ?? [],
                'billing_data' => array_merge([
                    'first_name' => 'NA',
                    'last_name' => 'NA',
                    'email' => 'NA@tasty.com',
                    'phone_number' => 'NA',
                    'apartment' => 'NA',
                    'floor' => 'NA',
                    'street' => 'NA',
                    'building' => 'NA',
                    'shipping_method' => 'NA',
                    'postal_code' => 'NA',
                    'city' => 'NA',
                    'country' => 'NA',
                    'state' => 'NA',
                ], $billingData),
                'extras' => [
                    'merchant_order_id' => (string)($extras['order_id'] ?? '')
                ],
                'redirection_url' => url('/api/payments/paymob/callback'),
                'notification_url' => url('/api/payments/paymob/webhook'),
            ]);

            if (!$response->successful()) {
                Log::error('Paymob Intention Creation Failed', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                
                $data = $response->json();
                if (isset($data['message'])) {
                    throw new \Exception('فشل إنشاء عملية الدفع: ' . $data['message']);
                }
                
                throw new \Exception('فشل إنشاء عملية الدفع في Paymob');
            }

            return $response->json();
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'Paymob') || str_contains($e->getMessage(), 'عملية الدفع')) throw $e;
            throw new \Exception('فشل إنشاء عملية الدفع في Paymob: ' . $e->getMessage());
        }
    }
}
