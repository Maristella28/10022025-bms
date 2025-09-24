<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    // List all assets
    public function index()
    {
        return response()->json(Asset::all());
    }

    // Store new asset (admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'price' => 'required|numeric',
            'category' => 'nullable|string',
            'stock' => 'required|integer',
            'status' => 'required|in:in_stock,limited,available,out_of_stock',
            'available_dates' => 'nullable',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        // Always handle available_dates robustly
        $dates = $request->input('available_dates');
        \Log::info('Available Dates (store):', [$dates]);
        if (is_string($dates)) {
            $dates = json_decode($dates, true);
        }
        if (!is_array($dates)) $dates = [];
        $validated['available_dates'] = $dates;

        $asset = Asset::create($validated);
        return response()->json($asset, 201);
    }

    // Update asset (admin)
    public function update(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'price' => 'sometimes|numeric',
            'category' => 'nullable|string',
            'stock' => 'sometimes|integer',
            'status' => 'sometimes|in:in_stock,limited,available,out_of_stock',
            'available_dates' => 'nullable',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        // Always handle available_dates robustly
        $dates = $request->input('available_dates');
        \Log::info('Available Dates (update):', [$dates]);
        if (is_string($dates)) {
            $dates = json_decode($dates, true);
        }
        if (!is_array($dates)) $dates = [];
        $validated['available_dates'] = $dates;

        $asset->update($validated);
        return response()->json($asset);
    }

    public function show($id)
    {
        $asset = Asset::findOrFail($id);
        return response()->json($asset);
    }
} 