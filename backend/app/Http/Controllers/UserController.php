<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Get the current user's permissions
     */
    public function getPermissions(Request $request)
    {
        try {
            $user = $request->user();
            \Log::info('Getting permissions for user:', [
                'id' => $user->id,
                'role' => $user->role,
                'name' => $user->name,
                'email' => $user->email
            ]);

            // For admin users, grant all module permissions
            if ($user->role === 'admin') {
                $defaultPermissions = [
                    'dashboard' => true,
                    'residentsRecords' => true,
                    'documentsRecords' => true,
                    'householdRecords' => true,
                    'blotterRecords' => true,
                    'financialTracking' => true,
                    'barangayOfficials' => true,
                    'staff' => true,
                    'communicationAnnouncement' => true,
                    'projectManagement' => true,
                    'socialServices' => true,
                    'disasterEmergency' => true,
                    'inventoryAssets' => true,
                    'activityLogs' => true
                ];
                
                \Log::info('Admin permissions:', $defaultPermissions);
                
                return response()->json([
                    'message' => 'Admin permissions retrieved successfully',
                    'permissions' => $defaultPermissions
                ]);
            }
            
            // For non-admin users, get the associated staff record
            $staff = Staff::where('user_id', $user->id)->first();
            
            if (!$staff) {
                return response()->json([
                    'message' => 'Staff record not found',
                    'permissions' => [
                        'dashboard' => true // Default permission
                    ]
                ]);
            }

            // Log the permissions being returned
            \Log::info('Fetching user permissions', [
                'user_id' => $user->id,
                'staff_id' => $staff->id,
                'role' => $user->role,
                'permissions' => $staff->permissions
            ]);

            // Use module_permissions from staff record
            $permissions = $staff->module_permissions ?? ['dashboard' => true];
            
            // Ensure permissions is an associative array
            if (is_array($permissions) && array_values($permissions) === $permissions) {
                $permissions = array_fill_keys($permissions, true);
            }

            // Log the permissions being sent
            \Log::info('Returning staff permissions', [
                'user_id' => $user->id,
                'staff_id' => $staff->id,
                'permissions' => $permissions
            ]);

            return response()->json([
                'message' => 'Permissions retrieved successfully',
                'permissions' => $permissions
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching user permissions:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error retrieving permissions',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}