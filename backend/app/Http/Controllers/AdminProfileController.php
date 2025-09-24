<?php

namespace App\Http\Controllers;

use App\Models\AdminProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminProfileController extends Controller
{
    // Get the authenticated admin's profile
    public function show()
    {
        $user = Auth::user();
        $profile = AdminProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }
        return response()->json($profile);
    }

    // Create or update the authenticated admin's profile
    public function update(Request $request)
    {
        $user = Auth::user();
        
        // Debug: Log the incoming request data
        \Log::info('AdminProfile update request', [
            'user_id' => $user->id,
            'request_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
        ]);
        
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'avatar' => 'nullable|string', // Accept string URL
                'phone' => 'nullable|string|max:50',
                'address' => 'nullable|string',
                'position' => 'nullable|string|max:100',
            ]);
            
            \Log::info('AdminProfile validation passed', ['validated_data' => $data]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('AdminProfile validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        $profile = AdminProfile::updateOrCreate(
            ['user_id' => $user->id],
            array_merge($data, ['user_id' => $user->id])
        );
        
        \Log::info('AdminProfile updated successfully', ['profile_id' => $profile->id]);
        
        return response()->json($profile);
    }
}
