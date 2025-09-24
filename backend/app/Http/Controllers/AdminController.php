<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AdminController extends Controller
{
    /**
     * Admin Dashboard Overview
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized, your role is ' . $user->role], 403);
        }

        $users = User::all();

        return response()->json([
            'message' => 'Welcome, Admin!',
            'users' => $users,
            'current_user' => $user,
        ]);
    }

    /**
     * 🧍‍♂️ Get all users (with 'residents' role) who don't have a profile yet
     */
    public function usersWithoutProfiles()
    {
        $users = User::where('role', 'residents')
            ->whereDoesntHave('profile')
            ->select('id', 'name', 'email') // Only return minimal data needed for display
            ->orderBy('name') // Optional: Sort alphabetically
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * 🧑‍🤝‍🧑 Get all users with 'residents' role
     */
    public function residents()
    {
        \Log::info('AdminController::residents method called');
        
        try {
            $users = User::where('role', 'residents')
                ->with('profile') // Eager load profile data
                ->select('id', 'name', 'email', 'created_at') // Only return needed data
                ->orderBy('name') // Sort alphabetically
                ->get();

            \Log::info('Found users with residents role', ['count' => $users->count()]);

            return response()->json([
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in AdminController::residents', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch residents users',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
