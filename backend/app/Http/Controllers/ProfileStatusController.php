<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileStatusController extends Controller
{
    public function check()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['isComplete' => false, 'message' => 'Not authenticated'], 401);
            }
            
            // Get the resident and profile
            $resident = \App\Models\Resident::where('user_id', $user->id)->first();
            
            if (!$resident || !$resident->profile) {
                return response()->json(['isComplete' => false, 'message' => 'No profile found']);
            }
            
            $profile = $resident->profile;
            
            // Use the same logic as ProtectedRoute for consistency
            $isComplete = $this->isProfileComplete($profile);
            
            return response()->json([
                'isComplete' => $isComplete,
                'profile_completed' => $profile->profile_completed,
                'verification_status' => $profile->verification_status,
                'user_id' => $user->id,
                'message' => $isComplete ? 'Profile is complete' : 'Profile is incomplete'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('ProfileStatusController error: ' . $e->getMessage());
            return response()->json(['isComplete' => false, 'message' => 'Error checking profile status'], 500);
        }
    }
    
    /**
     * Check if a profile is truly complete using the same logic as frontend ProtectedRoute
     */
    private function isProfileComplete($profile)
    {
        if (!$profile) {
            return false;
        }
        
        // Primary check: If backend says profile_completed is true, treat as complete
        if ($profile->profile_completed === true || $profile->profile_completed === 1 || $profile->profile_completed === '1') {
            return true;
        }
        
        // Secondary check: If verification is approved and has essential fields
        $verificationApproved = $profile->verification_status === 'approved';
        if ($verificationApproved) {
            $hasEssentialFields = $profile->first_name && $profile->last_name && $profile->current_address;
            $hasPhoto = $profile->current_photo || $profile->avatar;
            $hasResidencyImage = $profile->residency_verification_image;
            
            return $hasEssentialFields && $hasPhoto && $hasResidencyImage;
        }
        
        return false;
    }
}
