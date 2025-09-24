<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ResidentBenefitsController extends Controller
{
    public function toggle(Request $request, $id)
    {
        Log::info('Toggling My Benefits for resident', [
            'id' => $id,
            'enabled' => $request->input('enabled'),
            'user_id' => $request->user()->id ?? 'none',
            'beneficiary_data' => $request->all()
        ]);

        try {
            // Accept either numeric PK or resident_id string (e.g., 'R-23-...')
            $resident = Resident::with('profile')->find($id);
            if (!$resident) {
                // try resident_id fallback
                $resident = Resident::with('profile')->where('resident_id', $id)->first();
            }
            if (!$resident) {
                Log::error('Resident not found for toggle', ['id' => $id]);
                return response()->json(['message' => 'Resident not found'], 404);
            }

            $profile = $resident->profile;
            if (!$profile) {
                Log::error('Profile not found for resident', ['resident_id' => $resident->id]);
                return response()->json(['message' => 'Resident profile not found'], 400);
            }

            // Normalize permissions to array/object
            $permissions = $profile->permissions ?? [];
            if (is_string($permissions)) {
                $decoded = json_decode($permissions, true);
                $permissions = is_array($decoded) ? $decoded : [];
            }
            if (!is_array($permissions)) {
                $permissions = (array) $permissions;
            }

            $enabled = $request->input('enabled', true);
            $permissions['my_benefits'] = (bool) $enabled;

            // Log the update attempt
            Log::info('Updating profile permissions', [
                'profile_id' => $profile->id,
                'resident_id' => $resident->id,
                'enabled' => $enabled,
                'previous_permissions' => $profile->permissions,
                'new_permissions' => $permissions
            ]);

            // Persist: ensure JSON stored and explicit boolean column kept in sync
            $profile->permissions = $permissions;
            $profile->my_benefits_enabled = (bool) $enabled;
            $profile->save();

            return response()->json([
                'message' => 'My Benefits permission updated',
                'enabled' => (bool)$enabled
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to toggle My Benefits', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'resident_id' => $id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'message' => 'Failed to update permission: ' . $e->getMessage()
            ], 500);
        }
    }
}