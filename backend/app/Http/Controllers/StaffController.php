<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Illuminate\Database\QueryException;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index()
    {
        try {
            $staff = Staff::where('active', true)->get();
            return response()->json(['staff' => $staff]);
        } catch (QueryException $e) {
            \Log::error('Database error in StaffController@index: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch staff list'], 500);
        } catch (\Exception $e) {
            \Log::error('Error in StaffController@index: ' . $e->getMessage());
            return response()->json(['message' => 'An unexpected error occurred'], 500);
        }
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();
            
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required', 
                    'string', 
                    'email', 
                    'max:255',
                    'unique:users,email',
                    'unique:staff,email'
                ],
                'password' => ['required', Password::defaults()],
                'modulePermissions' => ['required', 'array'],
                'modulePermissions.*' => ['required', 'boolean'],
                'department' => ['required', 'string', 'max:255'],
                'contactNumber' => ['required', 'string', 'max:255'],
                'position' => ['required', 'string', 'max:255'],
                'birthdate' => ['required', 'date'],
                'gender' => ['required', 'string'],
                'civilStatus' => ['required', 'string'],
                'address' => ['nullable', 'string'],
                'selectedResident' => ['nullable']
            ]);

            // Create user account first
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'staff',
                'residency_status' => 'active'
            ]);

            // Then create staff record
            // Transform the validated data to match database column names
            $staffData = [
                'user_id' => $user->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'department' => $validated['department'],
                'position' => $validated['position'],
                'contact_number' => $validated['contactNumber'],
                'birthdate' => $validated['birthdate'],
                'gender' => $validated['gender'],
                'civil_status' => $validated['civilStatus'],
                'address' => $validated['address'],
                'resident_id' => $validated['selectedResident'] ?: null, // Handle empty string
                'active' => true,
                'module_permissions' => $request->modulePermissions
            ];

            // Create staff record with properly formatted data
            $staff = Staff::create($staffData);

            DB::commit();

        return response()->json([
            'message' => 'Staff account created successfully',
            'staff' => $staff
        ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            \Log::error('Validation error creating staff account: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->validator->errors()->all()
            ], 422);
        } catch (QueryException $e) {
            DB::rollBack();
            \Log::error('Database error creating staff account: ' . $e->getMessage());
            
            // Check for duplicate email
            if ($e->getCode() === '23000') { // Integrity constraint violation
                return response()->json([
                    'message' => 'Email address is already in use',
                    'error' => 'duplicate_email'
                ], 422);
            }
            
            return response()->json([
                'message' => 'Database error while creating staff account',
                'error' => 'database_error'
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating staff account: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create staff account',
                'error' => 'server_error'
            ], 500);
        }
    }

    /**
     * Display the specified staff member.
     */
    public function show(Staff $staff)
    {
        return response()->json($staff);
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, Staff $staff)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:staff,email,' . $staff->id],
            'department' => ['sometimes', 'string', 'max:255'],
            'contact_number' => ['sometimes', 'string', 'max:255'],
            'role' => ['sometimes', 'string', 'in:staff,admin']
        ]);

        $staff->update($validated);

        return response()->json([
            'message' => 'Staff account updated successfully',
            'staff' => $staff
        ]);
    }

    /**
     * Deactivate the specified staff member.
     */
    public function deactivate(Staff $staff)
    {
        $staff->update(['active' => false]);

        return response()->json([
            'message' => 'Staff account deactivated successfully',
            'staff' => $staff
        ]);
    }

    /**
     * Reactivate the specified staff member.
     */
    public function reactivate(Staff $staff)
    {
        $staff->update(['active' => true]);

        return response()->json([
            'message' => 'Staff account reactivated successfully',
            'staff' => $staff
        ]);
    }

    /**
     * Update module permissions for a staff member.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateModulePermissions(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            // Find the staff member
            $staff = Staff::findOrFail($id);
            
            // Validate the request data
            $validated = $request->validate([
                'module_permissions' => ['required', 'array'],
                'module_permissions.*' => ['boolean'],
                'staff_id' => ['required', 'integer', 'exists:staff,id']
            ]);

            // Log the update request
            Log::info('Received permissions update request', [
                'staff_id' => $id,
                'permissions' => $request->module_permissions
            ]);

            // The frontend already sends permissions in the correct backend format
            // No additional mapping needed - just use the permissions directly
            $incomingPermissions = $request->module_permissions;
            
            // Define all expected permission keys with default false values
            $defaultPermissions = [
                'dashboard' => false,
                'residentsRecords' => false,
                'documentsRecords' => false,
                'householdRecords' => false,
                'blotterRecords' => false,
                'financialTracking' => false,
                'barangayOfficials' => false,
                'staffManagement' => false,
                'communicationAnnouncement' => false,
                'socialServices' => false,
                'disasterEmergency' => false,
                'projectManagement' => false,
                'inventoryAssets' => false,
                'activityLogs' => false
            ];
            
            // Merge incoming permissions with defaults to ensure all keys are present
            $finalPermissions = array_merge($defaultPermissions, $incomingPermissions);
            
            // Update the staff permissions
            $staff->module_permissions = $finalPermissions;
            
            // Log the permissions being saved
            Log::info('Saving staff permissions', [
                'staff_id' => $staff->id,
                'original_permissions' => $request->module_permissions,
                'final_permissions' => $finalPermissions
            ]);
            
            $staff->save();

            DB::commit();

            // Return success response
            return response()->json([
                'message' => 'Permissions updated successfully',
                'staff' => $staff
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error updating permissions: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->validator->errors()->all()
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            Log::error('Staff not found: ' . $e->getMessage());
            return response()->json([
                'message' => 'Staff member not found'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating permissions: ' . $e->getMessage(), [
                'exception' => $e,
                'staff_id' => $id
            ]);
            return response()->json([
                'message' => 'An error occurred while updating permissions'
            ], 500);
        }
    }
}