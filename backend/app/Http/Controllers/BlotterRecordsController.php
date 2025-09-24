<?php

namespace App\Http\Controllers;

use App\Models\BlotterRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BlotterRecordsController extends Controller
{
    // List all blotter records with resident info
    public function index()
    {
        $records = BlotterRecord::with('resident')->orderBy('created_at', 'desc')->get();
        return response()->json(['records' => $records]);
    }

    // Show a single blotter record by ID
    public function show($id)
    {
        $record = BlotterRecord::with('resident')->findOrFail($id);
        return response()->json(['record' => $record]);
    }

    // Store a new blotter record (for NewComplaint.jsx)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'complainant_name' => 'required|string|max:255',
            'respondent_name' => 'required|string|max:255',
            'complaint_type' => 'required|string|max:255',
            'complaint_details' => 'required|string',
            'incident_date' => 'required|date',
            'incident_time' => 'required',
            'incident_location' => 'required|string|max:255',
            'witnesses' => 'nullable|string|max:255',
            'supporting_documents' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
            'preferred_action' => 'nullable|string|max:255',
            'contact_number' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'remarks' => 'nullable|string',
        ]);

        // Generate unique case number: BR-YYYYMMDD-XXXX
        $date = now()->format('Ymd');
        $countToday = \App\Models\BlotterRecord::whereDate('created_at', now()->toDateString())->count() + 1;
        $caseNumber = 'BR-' . $date . '-' . str_pad($countToday, 4, '0', STR_PAD_LEFT);
        $validated['case_number'] = $caseNumber;

        if ($request->hasFile('supporting_documents')) {
            $validated['supporting_documents'] = $request->file('supporting_documents')->store('blotter_documents', 'public');
        }

        $record = BlotterRecord::create($validated);

        return response()->json([
            'message' => 'Blotter complaint submitted successfully.',
            'data' => $record,
        ], 201);
    }
} 