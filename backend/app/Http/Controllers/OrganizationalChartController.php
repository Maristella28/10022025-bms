<?php

namespace App\Http\Controllers;

use App\Models\BarangayMember;
use Illuminate\Http\Request;

class OrganizationalChartController extends Controller
{
    // GET /api/organizational-chart/officials
    public function getOfficials()
    {
        $officials = BarangayMember::where('role', 'official')->get();
        return response()->json($officials);
    }

    // GET /api/organizational-chart/staff
    public function getStaff()
    {
        $staff = BarangayMember::where('role', 'staff')->get();
        return response()->json($staff);
    }

    // POST /api/admin/officials
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
            'role' => 'required|string|in:official,staff',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('officials', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $official = BarangayMember::create($validated);
        return response()->json($official, 201);
    }

    // PUT /api/admin/officials/{id}
    public function update(Request $request, $id)
    {
        $official = BarangayMember::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
            'role' => 'required|string|in:official,staff',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('officials', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $official->update($validated);
        return response()->json($official);
    }

    public function destroy($id)
    {
        $official = BarangayMember::findOrFail($id);
        $official->delete();
        return response()->json(['message' => 'Official deleted successfully.']);
    }
} 