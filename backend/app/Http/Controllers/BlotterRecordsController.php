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
        try {
            \Log::info('BlotterRecordsController@store called', [
                'request_data' => $request->all(),
                'has_file' => $request->hasFile('supporting_documents')
            ]);

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

            \Log::info('Validation passed', ['validated_data' => $validated]);

            // Generate unique case number: BR-YYYYMMDD-XXXX
            $date = now()->format('Ymd');
            $countToday = \App\Models\BlotterRecord::whereDate('created_at', now()->toDateString())->count() + 1;
            $caseNumber = 'BR-' . $date . '-' . str_pad($countToday, 4, '0', STR_PAD_LEFT);
            $validated['case_number'] = $caseNumber;

            if ($request->hasFile('supporting_documents')) {
                $validated['supporting_documents'] = $request->file('supporting_documents')->store('blotter_documents', 'public');
            }

            \Log::info('Creating blotter record', ['validated_data' => $validated]);

            $record = BlotterRecord::create($validated);

            \Log::info('Blotter record created successfully', ['record_id' => $record->id]);

            return response()->json([
                'message' => 'Blotter complaint submitted successfully.',
                'data' => $record,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed in BlotterRecordsController@store', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in BlotterRecordsController@store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to submit blotter complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 