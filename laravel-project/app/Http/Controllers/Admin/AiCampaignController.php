<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiCampaign;
use App\Services\AiCampaignDispatcher;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AiCampaignController extends Controller
{
    public function store(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'target_audience' => 'required|string',
            'suggested_time_window' => 'nullable|string',
            'reason' => 'nullable|string',
        ]);

        $campaign = AiCampaign::create([
            'restaurant_id' => $restaurant->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target_audience' => $validated['target_audience'],
            'suggested_time_window' => $validated['suggested_time_window'],
            'reason' => $validated['reason'],
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ الحملة كمسودة',
            'campaign' => $campaign
        ]);
    }

    public function show($id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        return response()->json([
            'success' => true,
            'campaign' => $campaign
        ]);
    }

    public function schedule(Request $request, $id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $validated = $request->validate([
            'scheduled_at' => 'required|date|after:now',
        ]);

        $campaign->update([
            'status' => 'scheduled',
            'scheduled_at' => Carbon::parse($validated['scheduled_at']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم جدولة الحملة بنجاح',
            'campaign' => $campaign
        ]);
    }

    public function cancel($id)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        $campaign->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء الحملة',
            'campaign' => $campaign
        ]);
    }

    public function sendNow($id, AiCampaignDispatcher $dispatcher)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) return response()->json(['error' => 'Restaurant not found'], 404);

        $campaign = AiCampaign::where('restaurant_id', $restaurant->id)->findOrFail($id);

        if ($campaign->status === 'draft') {
            $campaign->update(['status' => 'scheduled']);
        }

        $result = $dispatcher->dispatch($campaign, true);

        if ($result['success']) {
            $result['message'] = 'تم إرسال الحملة الآن بنجاح';
        }

        return response()->json($result);
    }
}
