<?php

namespace App\Http\Controllers;

use App\Models\BlotterRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlotterRequestController extends Controller
{
    // Admin: Fetch all blotter requests with resident and user info
    public function index()
    {
        \Log::info('Admin fetching all blotter requests');
        $requests = BlotterRequest::with(['user', 'resident'])->orderBy('created_at', 'desc')->get();
        \Log::info('Fetched blotter requests', ['count' => $requests->count(), 'ids' => $requests->pluck('id')]);
        return response()->json($requests);
    }

    // Resident: Create a new blotter request
    public function store(Request $request)
    {
        $user = Auth::user();
        $residentId = $request->input('resident_id');
        \Log::info('Resident creating blotter request', ['user_id' => $user ? $user->id : null, 'resident_id' => $residentId]);
        if (!$residentId) {
            \Log::warning('No resident_id provided');
            return response()->json(['error' => 'resident_id is required'], 422);
        }

        // Validate that the resident_id belongs to the authenticated user
        $resident = \App\Models\Resident::where('id', $residentId)->where('user_id', $user->id)->first();
        if (!$resident) {
            \Log::warning('Invalid resident_id or resident does not belong to user', [
                'user_id' => $user->id,
                'requested_resident_id' => $residentId
            ]);
            return response()->json(['error' => 'Invalid resident ID or resident does not belong to you'], 403);
        }

        $blotterRequest = BlotterRequest::create([
            'user_id' => $user ? $user->id : null,
            'resident_id' => $residentId,
            'status' => 'pending',
            'admin_message' => $request->input('admin_message'),
        ]);
        \Log::info('Blotter request created', ['id' => $blotterRequest->id]);

        return response()->json([
            'message' => 'Blotter request created successfully.',
            'blotter_request' => $blotterRequest
        ], 201);
    }

    // Admin: Update status of a blotter request (approve/decline)
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,declined',
            'admin_message' => 'nullable|string',
            'approved_date' => 'nullable|date',
        ]);

        $blotterRequest = BlotterRequest::with('user')->findOrFail($id);
        $blotterRequest->status = $validated['status'];
        $blotterRequest->admin_message = $validated['admin_message'] ?? null;

        if ($validated['status'] === 'approved') {
            // Set approved_date and generate ticket_number
            $blotterRequest->approved_date = $validated['approved_date'] ?? now();
            $blotterRequest->ticket_number = $blotterRequest->ticket_number ?? $this->generateTicketNumber($blotterRequest->id);
            $blotterRequest->save();
            // Notify user
            if ($blotterRequest->user) {
                $blotterRequest->user->notify(
                    new \App\Notifications\BlotterRequestApprovedNotification($blotterRequest)
                );
            }
        } else {
            $blotterRequest->approved_date = null;
            $blotterRequest->ticket_number = null;
            $blotterRequest->save();
            // Notify user if declined
            if ($blotterRequest->user) {
                $blotterRequest->user->notify(
                    new \App\Notifications\BlotterRequestDeclinedNotification($blotterRequest, $validated['admin_message'] ?? null)
                );
            }
        }

        return response()->json($blotterRequest);
    }

    // Generate a unique ticket number for a blotter request
    protected function generateTicketNumber($id)
    {
        return 'BLT-' . str_pad($id, 6, '0', STR_PAD_LEFT) . '-' . strtoupper(substr(uniqid(), -4));
    }

    public function myRequests(Request $request)
    {
        $user = $request->user();
        $requests = BlotterRequest::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }
}
