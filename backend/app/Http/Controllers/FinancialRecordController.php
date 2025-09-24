<?php

namespace App\Http\Controllers;

use App\Models\FinancialRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FinancialRecordController extends Controller
{
    // List all records with optional filters
    public function index(Request $request)
    {
        $query = FinancialRecord::query();
        if ($request->has('type')) $query->where('type', $request->type);
        if ($request->has('category')) $query->where('category', $request->category);
        if ($request->has('status')) $query->where('status', $request->status);
        if ($request->has('date_from')) $query->where('date', '>=', $request->date_from);
        if ($request->has('date_to')) $query->where('date', '<=', $request->date_to);
        return response()->json($query->orderBy('date', 'desc')->get());
    }

    // Show a single record
    public function show($id)
    {
        $record = FinancialRecord::findOrFail($id);
        return response()->json($record);
    }

    // Store a new record
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:Income,Expense',
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'description' => 'required|string',
            'reference' => 'nullable|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'status' => 'nullable|in:Pending,Completed,Rejected',
            'attachment' => 'nullable|file|max:2048',
        ]);
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('financial_attachments', 'public');
            $validated['attachment'] = '/storage/' . $path;
        }
        $record = FinancialRecord::create($validated);
        return response()->json($record, 201);
    }

    // Update a record
    public function update(Request $request, $id)
    {
        $record = FinancialRecord::findOrFail($id);
        $validated = $request->validate([
            'date' => 'sometimes|required|date',
            'type' => 'sometimes|required|in:Income,Expense',
            'category' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric',
            'description' => 'sometimes|required|string',
            'reference' => 'nullable|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'status' => 'nullable|in:Pending,Completed,Rejected',
            'attachment' => 'nullable|file|max:2048',
        ]);
        if ($request->hasFile('attachment')) {
            // Delete old file if exists
            if ($record->attachment && Storage::disk('public')->exists(str_replace('/storage/', '', $record->attachment))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $record->attachment));
            }
            $path = $request->file('attachment')->store('financial_attachments', 'public');
            $validated['attachment'] = '/storage/' . $path;
        }
        $record->update($validated);
        return response()->json($record);
    }

    // Delete a record
    public function destroy($id)
    {
        $record = FinancialRecord::findOrFail($id);
        if ($record->attachment && Storage::disk('public')->exists(str_replace('/storage/', '', $record->attachment))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $record->attachment));
        }
        $record->delete();
        return response()->json(['message' => 'Record deleted successfully.']);
    }
} 