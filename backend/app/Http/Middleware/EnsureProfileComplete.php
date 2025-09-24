<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureProfileComplete
{
    /**
     * Handle an incoming request.
     * If the user's profile is incomplete or verification requires action,
     * return a 403 JSON response with a redirect hint.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Allow admins to bypass this middleware
        if ((method_exists($user, 'hasRole') && $user->hasRole('admin')) || (isset($user->role) && $user->role === 'admin') || (isset($user->is_admin) && $user->is_admin)) {
            return $next($request);
        }

        // Try to find the resident and its profile
        $resident = \App\Models\Resident::with('profile')->where('user_id', $user->id)->first();

        if (!$resident) {
            return response()->json([
                'message' => 'Profile incomplete. Please complete your profile to access this feature.',
                'redirect' => '/user/profile'
            ], 403);
        }

        $profile = $resident->profile;
        if (!$profile) {
            return response()->json([
                'message' => 'Profile incomplete. Please complete your profile to access this feature.',
                'redirect' => '/user/profile'
            ], 403);
        }

        // Denied verification -> direct user to residency denied page
        if (isset($profile->verification_status) && $profile->verification_status === 'denied') {
            return response()->json([
                'message' => 'Residency verification denied. Please follow the instructions.',
                'redirect' => '/residency-denied'
            ], 403);
        }

        // Missing residency verification image -> require upload
        if (empty($profile->residency_verification_image)) {
            return response()->json([
                'message' => 'Residency verification required. Please upload your residency verification image.',
                'redirect' => '/residency-verification'
            ], 403);
        }

        // Minimal completeness checks (these can be extended)
        $required = ['first_name', 'last_name', 'birth_date', 'current_address'];
        foreach ($required as $field) {
            if (empty($profile->{$field})) {
                return response()->json([
                    'message' => 'Profile incomplete. Please fill out your profile.',
                    'redirect' => '/user/profile',
                    'missing' => $field
                ], 403);
            }
        }

        // Require either current_photo or avatar
        if (empty($profile->current_photo) && empty($profile->avatar)) {
            return response()->json([
                'message' => 'Profile photo is required. Please upload a profile photo.',
                'redirect' => '/user/profile',
                'missing' => 'current_photo'
            ], 403);
        }

        return $next($request);
    }
}
