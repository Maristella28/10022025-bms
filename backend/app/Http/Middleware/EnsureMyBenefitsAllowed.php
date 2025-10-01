<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureMyBenefitsAllowed
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Admins bypass
        if ((method_exists($user, 'hasRole') && $user->hasRole('admin')) || (isset($user->role) && $user->role === 'admin') || (isset($user->is_admin) && $user->is_admin)) {
            return $next($request);
        }

        $resident = \App\Models\Resident::with('profile')->where('user_id', $user->id)->first();
        if (!$resident || !$resident->profile) {
            return response()->json([
                'message' => 'Access denied. Complete your profile to request this feature.',
                'redirect' => '/user/profile'
            ], 403);
        }

        $p = $resident->profile;
        $hasFlag = false;

        if (isset($p->permissions)) {
            if (is_array($p->permissions) && !empty($p->permissions['my_benefits'])) {
                $hasFlag = true;
            }
            if (is_object($p->permissions) && !empty($p->permissions->my_benefits)) {
                $hasFlag = true;
            }
        }

        if (!$hasFlag) {
            if (!empty($p->can_view_my_benefits) || !empty($p->my_benefits_enabled) || !empty($p->show_my_benefits)) {
                $hasFlag = true;
            }
        }

        // Allow access even if My Benefits is not enabled - the controller will handle the response
        // This allows residents to see the My Benefits page even if they don't have any benefits yet
        return $next($request);
    }
}
