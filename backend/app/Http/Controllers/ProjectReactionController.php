<?php

namespace App\Http\Controllers;

use App\Models\ProjectReaction;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectReactionController extends Controller
{
    /**
     * Get reaction counts for a project
     */
    public function index(Request $request, $projectId): JsonResponse
    {
        $reactions = ProjectReaction::where('project_id', $projectId)
            ->selectRaw('reaction_type, COUNT(*) as count')
            ->groupBy('reaction_type')
            ->get()
            ->pluck('count', 'reaction_type')
            ->toArray();

        return response()->json([
            'like' => $reactions['like'] ?? 0,
            'love' => $reactions['love'] ?? 0,
        ]);
    }

    /**
     * Add or update a reaction to a project
     */
    public function react(Request $request, $projectId): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'You must be logged in to react.'], 401);
        }
        $request->validate([
            'reaction_type' => 'required|string|in:like,love',
        ]);

        $userId = $user->id;
        $reactionType = $request->reaction_type;

        $existingReaction = ProjectReaction::where('project_id', $projectId)
            ->where('user_id', $userId)
            ->first();

        if ($existingReaction) {
            $existingReaction->update(['reaction_type' => $reactionType]);
        } else {
            ProjectReaction::create([
                'project_id' => $projectId,
                'user_id' => $userId,
                'reaction_type' => $reactionType,
            ]);
        }

        return $this->index($request, $projectId);
    }
} 