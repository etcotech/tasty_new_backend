<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentGatewayController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();

        if (!$restaurant) {
            return redirect()->route('admin.dashboard')->with('error', 'يجب اختيار مطعم أولاً');
        }

        $paymentGateway = PaymentGateway::firstOrCreate(
            ['restaurant_id' => $restaurant->id],
            [
                'currency' => 'SAR',
                'mode' => 'test',
                'is_enabled' => false
            ]
        );

        return Inertia::render('Admin/PaymentGateways', [
            'gateway' => $paymentGateway,
            'restaurant' => $restaurant,
        ]);
    }

    public function update(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();

        if (!$restaurant) {
            return redirect()->route('admin.dashboard')->with('error', 'يجب اختيار مطعم أولاً');
        }

        $validated = $request->validate([
            'paymob_api_key' => 'nullable|string',
            'paymob_secret_key' => 'nullable|string',
            'paymob_public_key' => 'nullable|string',
            'paymob_integration_id' => 'nullable|string',
            'paymob_iframe_id' => 'nullable|string',
            'paymob_hmac_secret' => 'nullable|string',
            'currency' => 'required|string|max:10',
            'mode' => 'required|in:test,live',
            'is_enabled' => 'boolean',
        ]);

        $gateway = PaymentGateway::updateOrCreate(
            ['restaurant_id' => $restaurant->id],
            $validated
        );

        return redirect()->back()->with('success', 'تم حفظ إعدادات بوابة الدفع بنجاح');
    }
}
