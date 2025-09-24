<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResidencyStatusController extends Controller
{
    /**
     * Update residency status of a user.
     * Only accessible by admin users.
     */
    public function updateStatus(Request $request, $userId)
    {
        $admin = Auth::user();

        if (!$admin || $admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'residency_status' => 'required|in:active,deceased,relocated,for_review',
            'status_notes' => 'nullable|string|max:1000',
        ]);

        $user = User::findOrFail($userId);

        $previousStatus = $user->residency_status;

        $user->updateResidencyStatus(
            $request->input('residency_status'),
            $request->input('status_notes'),
            $admin->id
        );

        // When residency is set to active, also approve verification on the resident/profile
        if ($request->input('residency_status') === 'active') {
            $resident = \App\Models\Resident::where('user_id', $user->id)
                ->with('profile')
                ->orderByRaw("CASE WHEN verification_status = 'approved' THEN 0 ELSE 1 END")
                ->orderByDesc('updated_at')
                ->first();

            if ($resident) {
                $resident->verification_status = 'approved';
                $resident->save();

                if ($resident->profile) {
                    $resident->profile->verification_status = 'approved';
                    $resident->profile->denial_reason = null;
                    $resident->profile->save();
                }

                \Log::info('Auto-approved verification due to active residency status', [
                    'user_id' => $user->id,
                    'resident_id' => $resident->id,
                ]);
            }
        }

        // Optionally log this action in activity logs (if ActivityLogService is available)
        $serviceClass = '\\App\\Services\\ActivityLogService';
        if (class_exists($serviceClass)) {
            $service = app($serviceClass);
            $logMessage = "Residency status updated from {$previousStatus} to {$user->residency_status} by admin " . ($admin->name ?? $admin->id);

            if (is_object($service) && method_exists($service, 'logCustom')) {
                // Use dynamic call to avoid static analysis errors when the class isn't present in all envs
                call_user_func([$service, 'logCustom'],
                    'residency_status_update',
                    $logMessage,
                    $user,
                    ['previous_status' => $previousStatus, 'new_status' => $user->residency_status]
                );
            } elseif (is_object($service) && method_exists($service, 'log')) {
                call_user_func([$service, 'log'],
                    'residency_status_update',
                    $logMessage,
                    ['user_id' => $user->id, 'previous_status' => $previousStatus, 'new_status' => $user->residency_status]
                );
            } else {
                \Illuminate\Support\Facades\Log::info('residency_status_update', [
                    'message' => "Residency status updated from {$previousStatus} to {$user->residency_status}",
                    'by_admin' => $admin->id,
                    'user_id' => $user->id,
                    'previous_status' => $previousStatus,
                    'new_status' => $user->residency_status,
                ]);
            }
        } else {
            \Illuminate\Support\Facades\Log::info('residency_status_update', [
                'message' => "Residency status updated from {$previousStatus} to {$user->residency_status}",
                'by_admin' => $admin->id,
                'user_id' => $user->id,
                'previous_status' => $previousStatus,
                'new_status' => $user->residency_status,
            ]);
        }

        return response()->json([
            'message' => 'Residency status updated successfully.',
            'user' => $user->fresh(),
        ]);
    }
}
