<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Resident;
use App\Models\DocumentRequest;
use App\Models\Household;
use App\Models\BlotterRecord;
use App\Models\BlotterRequest;
use App\Models\AssetRequest;
use App\Models\BarangayMember;

class AdminController extends Controller
{
    /**
     * Admin Dashboard Overview with Real Statistics
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

        try {
            // Get real statistics from the database
            $statistics = [
                'total_residents' => Resident::count(),
                'certificates_issued' => DocumentRequest::where('status', 'completed')->count(),
                'pending_requests' => DocumentRequest::where('status', 'pending')->count() + 
                                   BlotterRequest::where('status', 'pending')->count() + 
                                   AssetRequest::where('status', 'pending')->count(),
                'household_records' => Household::count(),
                'blotter_reports' => BlotterRecord::count(),
                'barangay_officials' => BarangayMember::where('role', 'official')->count(),
                'barangay_staff' => BarangayMember::where('role', 'staff')->count(),
            ];

            return response()->json([
                'message' => 'Welcome, Admin!',
                'statistics' => $statistics,
                'current_user' => $user,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching dashboard statistics', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error fetching dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🧍‍♂️ Get all users (with 'residents' role) who have incomplete profiles
     */
    public function usersWithoutProfiles()
    {
        $users = User::where('role', 'residents')
            ->whereHas('profile', function($query) {
                $query->where('profile_completed', false)
                      ->orWhereNull('profile_completed');
            })
            ->select('id', 'name', 'email') // Only return minimal data needed for display
            ->orderBy('name') // Optional: Sort alphabetically
            ->get();

        \Log::info('Users with incomplete profiles found', [
            'count' => $users->count(),
            'users' => $users->pluck('email')->toArray()
        ]);

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
                ->with(['profile', 'resident']) // Eager load both profile and resident data
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
