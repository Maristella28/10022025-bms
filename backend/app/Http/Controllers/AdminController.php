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
        $users = User::where('role', 'residents')
            ->with('profile') // Eager load profile data
            ->select('id', 'name', 'email', 'created_at') // Only return needed data
            ->orderBy('name') // Sort alphabetically
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }
}
