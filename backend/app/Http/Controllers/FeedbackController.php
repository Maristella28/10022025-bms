<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FeedbackController extends Controller
{
    /**
     * Display a listing of feedback (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Feedback::with('user')->orderBy('created_at', 'desc');
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        $feedbacks = $query->get();
        return response()->json($feedbacks);
    }

    /**
     * Store a newly created feedback.
     */
    public function store(Request $request): JsonResponse
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'category' => 'required|string|in:General,Project,Service,Complaint,Suggestion',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        try {
            $feedback = Feedback::create([
                'user_id' => $request->user()->id,
                'subject' => $request->subject,
                'message' => $request->message,
                'category' => $request->category,
                'status' => 'Pending',
                'project_id' => $request->project_id,
            ]);

            return response()->json($feedback->load('user'), 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified feedback.
     */
    public function show(Feedback $feedback): JsonResponse
    {
        return response()->json($feedback->load('user'));
    }

    /**
     * Update the specified feedback status (admin only).
     */
    public function update(Request $request, Feedback $feedback): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:Pending,Reviewed,Resolved'
        ]);

        $feedback->update(['status' => $request->status]);
        return response()->json($feedback->load('user'));
    }

    /**
     * Remove the specified feedback.
     */
    public function destroy(Feedback $feedback): JsonResponse
    {
        $feedback->delete();
        return response()->json(null, 204);
    }

    /**
     * Get feedback for the authenticated user.
     */
    public function myFeedback(Request $request): JsonResponse
    {
        $feedbacks = Feedback::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($feedbacks);
    }
} 