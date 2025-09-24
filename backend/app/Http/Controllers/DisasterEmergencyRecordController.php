<?php

namespace App\Http\Controllers;

use App\Models\DisasterEmergencyRecord;
use Illuminate\Http\Request;

class DisasterEmergencyRecordController extends Controller
{
    // List all records
    public function index()
    {
        return response()->json(DisasterEmergencyRecord::orderBy('date', 'desc')->get());
    }

    // Show a single record
    public function show($id)
    {
        $record = DisasterEmergencyRecord::findOrFail($id);
        return response()->json($record);
    }

    // Store a new record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'date' => 'required|date',
            'location' => 'required|string|max:255',
            'description' => 'required|string',
            'actions_taken' => 'nullable|string',
            'casualties' => 'nullable|string',
            'reported_by' => 'nullable|string|max:255',
        ]);
        $record = DisasterEmergencyRecord::create($validated);
        return response()->json($record, 201);
    }

    // Update a record
    public function update(Request $request, $id)
    {
        $record = DisasterEmergencyRecord::findOrFail($id);
        $validated = $request->validate([
            'type' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'location' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'actions_taken' => 'nullable|string',
            'casualties' => 'nullable|string',
            'reported_by' => 'nullable|string|max:255',
        ]);
        $record->update($validated);
        return response()->json($record);
    }

    // Delete a record
    public function destroy($id)
    {
        $record = DisasterEmergencyRecord::findOrFail($id);
        $record->delete();
        return response()->json(['message' => 'Record deleted successfully.']);
    }
} 