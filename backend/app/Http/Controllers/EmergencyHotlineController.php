<?php

namespace App\Http\Controllers;

use App\Models\EmergencyHotline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmergencyHotlineController extends Controller
{
    // List all hotlines (public)
    public function index()
    {
        return response()->json(EmergencyHotline::orderBy('type')->get());
    }

    // Show a single hotline (public)
    public function show($id)
    {
        $hotline = EmergencyHotline::findOrFail($id);
        return response()->json($hotline);
    }

    // Create a new hotline (admin only)
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'hotline' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|max:50',
            'last_updated' => 'nullable|date',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'procedure' => 'nullable|array',
        ]);
        $hotline = EmergencyHotline::create($validated);
        return response()->json($hotline, 201);
    }

    // Update a hotline (admin only)
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $hotline = EmergencyHotline::findOrFail($id);
        $validated = $request->validate([
            'type' => 'sometimes|required|string|max:255',
            'hotline' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|max:50',
            'last_updated' => 'nullable|date',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'procedure' => 'nullable|array',
        ]);
        $hotline->update($validated);
        return response()->json($hotline);
    }

    // Delete a hotline (admin only)
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $hotline = EmergencyHotline::findOrFail($id);
        $hotline->delete();
        return response()->json(['message' => 'Hotline deleted successfully.']);
    }
}
