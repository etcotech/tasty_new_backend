<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QrCodeController extends Controller
{
    public function index()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.dashboard');
        }

        $qrCodes = QrCode::with('branch')
            ->where('restaurant_id', $restaurant->id)
            ->latest()
            ->get();

        $branches = Branch::where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->get();

        return Inertia::render('Admin/QRCode', [
            'qrCodes'    => $qrCodes,
            'branches'   => $branches,
            'restaurant' => $restaurant,
        ]);
    }

    public function store(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return back()->withErrors(['error' => 'لم يتم تحديد مطعم']);
        }

        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'name'      => 'nullable|string|max:100',
        ]);

        $url = url('/' . $restaurant->slug);
        $branchId = null;

        if (!empty($validated['branch_id'])) {
            // Verify branch belongs to this restaurant
            $branch = Branch::where('id', $validated['branch_id'])
                ->where('restaurant_id', $restaurant->id)
                ->firstOrFail();
            
            $url .= '?branch=' . $branch->id;
            $branchId = $branch->id;
        }

        QrCode::create([
            'restaurant_id' => $restaurant->id,
            'branch_id'     => $branchId,
            'url'           => $url,
            'name'          => $validated['name'] ?? null,
            'type'          => 'self', // Default to self as type is removed from UI
        ]);

        return back()->with('success', 'تم إنشاء رمز QR بنجاح');
    }

    public function destroy(QrCode $qrCode)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant || $qrCode->restaurant_id !== $restaurant->id) {
            abort(403, 'غير مصرح');
        }

        $qrCode->delete();
        return back()->with('success', 'تم حذف رمز QR');
    }
}
