<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AddonController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Extras', [
            'extras' => Addon::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        Addon::create($request->all());

        return redirect()->back()->with('message', 'Extra created successfully');
    }

    public function update(Request $request, Addon $extra)
    {
        $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $extra->update($request->all());

        return redirect()->back()->with('message', 'Extra updated successfully');
    }

    public function destroy(Addon $extra)
    {
        $extra->delete();

        return redirect()->back()->with('message', 'Extra deleted successfully');
    }
}
