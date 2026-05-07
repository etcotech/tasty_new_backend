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

        // Check QR availability in plan
        if (auth()->user()->role !== 'super_admin') {
            $plan = $restaurant->subscription?->plan;
            if (!$plan || !$plan->has_qr) {
                return Inertia::render('Error', [
                    'message' => 'خدمة رموز QR غير متاحة في باقتك الحالية',
                    'title' => 'تحتاج إلى ترقية الباقة'
                ]);
            }
        }

        $qrCodes = QrCode::withTrashed()
            ->with('branch')
            ->where('restaurant_id', $restaurant->id)
            ->latest()
            ->get()
            ->map(function($qr) use ($restaurant) {
                $currentBaseUrl = url('/');
                $isOld = !str_starts_with($qr->url, $currentBaseUrl);
                
                // Also check if branch slug matches if branch exists
                if (!$isOld && $qr->branch) {
                    $expectedSuffix = '?branch=' . ($qr->branch->slug ?: $qr->branch->id);
                    if (!str_contains($qr->url, $expectedSuffix)) {
                        $isOld = true;
                    }
                }

                $status = 'نشط';
                if ($qr->trashed()) {
                    $status = 'محذوف';
                } elseif ($isOld) {
                    $status = 'قديم';
                }

                $qr->status_label = $status;
                return $qr;
            });

        $branches = Branch::where('restaurant_id', $restaurant->id)
            ->where('is_active', true)
            ->get();

        // System QRs
        $systemQrs = [];
        
        // 1. General Restaurant QR
        $systemQrs[] = [
            'id' => 'system-main',
            'name' => 'المنيو العام للمطعم',
            'url' => url('/' . $restaurant->slug),
            'is_system' => true,
            'branch' => null,
            'status_label' => 'نشط'
        ];

        // 2. Branch QRs
        foreach ($branches as $branch) {
            $systemQrs[] = [
                'id' => 'system-branch-' . $branch->id,
                'name' => 'منيو فرع: ' . $branch->name_ar,
                'url' => url('/' . $restaurant->slug . '?branch=' . ($branch->slug ?: $branch->id)),
                'is_system' => true,
                'branch' => $branch,
                'status_label' => 'نشط'
            ];
        }

        return Inertia::render('Admin/QRCode', [
            'qrCodes'    => $qrCodes,
            'systemQrs'  => $systemQrs,
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
            
            $url .= '?branch=' . ($branch->slug ?: $branch->id);
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

    public function regenerate(Request $request, $id)
    {
        $restaurant = $this->getCurrentRestaurant();
        $qrCode = QrCode::withTrashed()->findOrFail($id);
        
        if (!$restaurant || $qrCode->restaurant_id !== $restaurant->id) {
            abort(403, 'غير مصرح');
        }

        $url = url('/' . $restaurant->slug);
        if ($qrCode->branch_id) {
            $branch = Branch::find($qrCode->branch_id);
            if ($branch) {
                $url .= '?branch=' . ($branch->slug ?: $branch->id);
            }
        }
        
        $qrCode->update([
            'url' => $url,
            'deleted_at' => null // Restore if it was deleted during regeneration? 
            // Usually regenerate implies we want it active again.
        ]);
        
        return back()->with('success', 'تم تحديث الرمز بنجاح');
    }

    public function regenerateAll()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            abort(403);
        }

        $qrCodes = QrCode::where('restaurant_id', $restaurant->id)->get();
        foreach ($qrCodes as $qrCode) {
            $url = url('/' . $restaurant->slug);
            if ($qrCode->branch_id) {
                $branch = Branch::find($qrCode->branch_id);
                if ($branch) {
                    $url .= '?branch=' . ($branch->slug ?: $branch->id);
                }
            }
            $qrCode->update(['url' => $url]);
        }

        return back()->with('success', 'تم تحديث جميع الرموز بنجاح');
    }

    public function destroy($id)
    {
        $restaurant = $this->getCurrentRestaurant();
        $qrCode = QrCode::withTrashed()->findOrFail($id);

        if (!$restaurant || $qrCode->restaurant_id !== $restaurant->id) {
            abort(403, 'غير مصرح');
        }

        if ($qrCode->trashed()) {
            $qrCode->forceDelete();
            return back()->with('success', 'تم حذف الرمز نهائياً');
        }

        $qrCode->delete();
        return back()->with('success', 'تم نقل الرمز إلى المحذوفات');
    }
}
