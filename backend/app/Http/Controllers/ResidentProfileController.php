<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\Profile;
use App\Models\Resident;
use App\Notifications\ProfileUpdatedNotification;
use App\Mail\ResidencyVerificationDeniedMail;
use App\Notifications\ResidencyVerificationApproved;

class ResidentProfileController extends Controller
{
    // 🔍 Admin: List all residents with profiles
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $residents = Resident::with('profile', 'user')->get();
            \Log::info('ResidentProfileController@index debug', [
                'requested_by' => $user ? $user->id : null,
                'requested_by_role' => $user ? $user->role : null,
                'residents_count' => $residents->count(),
                'first_resident' => $residents->first(),
            ]);
            return response()->json([
                'residents' => $residents,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Resident index fetch failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch residents.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // 👤 Authenticated user: View own profile
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                \Log::error('Profile show: No authenticated user found');
                return response()->json([
                    'message' => 'Authentication required',
                    'error' => 'NO_AUTH'
                ], 401);
            }
            
            \Log::info('Profile show request', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role
            ]);
            
            // Check if user is admin and has admin profile
            if ($user->role === 'admin') {
                $adminProfile = \App\Models\AdminProfile::where('user_id', $user->id)->first();
                if ($adminProfile) {
                    \Log::info('Profile show: Admin user with admin profile found', [
                        'user_id' => $user->id,
                        'admin_profile_id' => $adminProfile->id
                    ]);
                    $profileData = $adminProfile->toArray();
                    $userWithProfile = $user->toArray();
                    $userWithProfile['profile'] = $profileData;
                    return response()->json([
                        'user' => $userWithProfile,
                        'profile' => $profileData,
                        'is_admin' => true,
                    ], 200);
                }
            }
            
            // ✅ ENHANCED: Direct connection to profiles table first (prioritize database "profile" table)
            $profile = Profile::where('user_id', $user->id)->first();
            
            if ($profile) {
                \Log::info('Profile show: Found profile in profiles table', [
                    'user_id' => $user->id,
                    'profile_id' => $profile->id,
                    'verification_status' => $profile->verification_status,
                    'profile_completed' => $profile->profile_completed,
                    'residency_verification_image' => $profile->residency_verification_image,
                ]);
                
                $profileData = $profile->toArray();
                
                // ✅ CRITICAL FIX: Get the actual resident record to ensure correct ID
                $resident = \App\Models\Resident::where('user_id', $user->id)->first();
                if ($resident) {
                    // Override the profile ID with the actual resident database ID
                    $profileData['id'] = $resident->id;
                    $profileData['resident_id'] = $resident->resident_id;
                    \Log::info('Profile show: Updated IDs from resident record', [
                        'profile_id' => $profile->id,
                        'resident_database_id' => $resident->id,
                        'resident_string_id' => $resident->resident_id
                    ]);
                }
                
                // ✅ Ensure avatar field is properly mapped for RequestDocuments.jsx
                if (!isset($profileData['avatar']) && isset($profileData['current_photo'])) {
                    $profileData['avatar'] = $profileData['current_photo'];
                }
                
                // ✅ Add computed fields for better frontend compatibility
                $profileData['full_name'] = trim(($profile->first_name ?? '') . ' ' . 
                                                 ($profile->middle_name ? $profile->middle_name . ' ' : '') . 
                                                 ($profile->last_name ?? '') . 
                                                 ($profile->name_suffix ? ' ' . $profile->name_suffix : ''));
                
                // ✅ Ensure address consistency for RequestDocuments.jsx autofill
                $profileData['full_address'] = $profileData['current_address'] ?? '';
                $profileData['address'] = $profileData['current_address'] ?? '';
                
                // ✅ Ensure contact fields consistency
                $profileData['contact_number'] = $profileData['mobile_number'] ?? '';
                
                // ✅ Ensure date fields consistency
                $profileData['date_of_birth'] = $profileData['birth_date'] ?? '';
                
                // ✅ Ensure gender/sex consistency
                $profileData['gender'] = $profileData['sex'] ?? '';
                
                // ✅ Ensure civil status consistency
                $profileData['civilStatus'] = $profileData['civil_status'] ?? '';
                
                // ✅ CRITICAL FIX: Ensure profile_completed is boolean, not NULL
                $profileData['profile_completed'] = $profile->profile_completed ? true : false;
                
                // ✅ CRITICAL FIX: Check beneficiaries table for actual benefits status
                $resident = \App\Models\Resident::where('user_id', $user->id)->first();
                if ($resident) {
                    $benefitsStatus = $this->getBenefitsStatusFromBeneficiaries($resident);
                    if ($benefitsStatus !== null) {
                        $profileData['my_benefits_enabled'] = $benefitsStatus;
                        // Also update permissions to ensure consistency
                        $permissions = $profileData['permissions'] ?? [];
                        if (is_string($permissions)) {
                            $permissions = json_decode($permissions, true) ?? [];
                        }
                        if (!is_array($permissions)) {
                            $permissions = (array) $permissions;
                        }
                        $permissions['my_benefits'] = $benefitsStatus;
                        $profileData['permissions'] = $permissions;
                        
                        \Log::info('Benefits status updated from beneficiaries table (direct profile)', [
                            'resident_id' => $resident->id,
                            'benefits_enabled' => $benefitsStatus,
                            'source' => 'beneficiaries_table'
                        ]);
                    }
                }
                
                $userWithProfile = $user->toArray();
                $userWithProfile['profile'] = $profileData;
                
                \Log::info('Profile show: Returning profile data from profiles table', [
                    'user_id' => $user->id,
                    'profile_residency_image' => $profileData['residency_verification_image'] ?? 'NOT_SET',
                    'profile_verification_status' => $profileData['verification_status'] ?? 'NOT_SET',
                    'profile_keys' => array_keys($profileData)
                ]);
                
                return response()->json([
                    'user' => $userWithProfile,
                    'profile' => $profileData,
                    'source' => 'profiles_table',
                    'profile_exists' => true,
                ], 200);
            }
            
            // ✅ Fallback: Try to get from residents table if profile doesn't exist
            $resident = \App\Models\Resident::where('user_id', $user->id)
                ->with('profile')
                ->orderByRaw("CASE WHEN verification_status = 'approved' THEN 0 ELSE 1 END")
                ->orderByDesc('updated_at')
                ->first();
                
            \Log::info('Profile show: Checking resident fallback', [
                'user_id' => $user->id,
                'resident_found' => $resident ? true : false,
                'resident_verification_status' => $resident ? $resident->verification_status : null,
                'resident_residency_image' => $resident ? $resident->residency_verification_image : null
            ]);
            
            if (!$resident) {
                \Log::info('Profile show: No resident or profile found for user', [
                    'user_id' => $user->id
                ]);
                // Return 200 with null profile to indicate profile needs to be created
                return response()->json([
                    'message' => 'Profile not found - needs to be created',
                    'user' => $user,
                    'profile' => null,
                    'profile_exists' => false,
                    'needs_profile_creation' => true
                ], 200);
            }
            
            // Return the resident data as the main profile data (fallback)
            \Log::info('Profile show: Using resident data as fallback', [
                'user_id' => $user->id,
                'resident_id' => $resident->id,
                'verification_status' => $resident->verification_status,
            ]);
            
            $profileData = $resident->toArray();
            
            // Store the resident's ID before merging with profile data
            $residentId = $resident->id;
            
            // If there's a separate profile record, merge any additional data
            if ($resident->profile) {
                $profileData = array_merge($profileData, $resident->profile->toArray());
                \Log::info('Profile show: Merged profile data with resident data', [
                    'user_id' => $user->id,
                    'merged_residency_image' => $profileData['residency_verification_image'] ?? null,
                    'merged_verification_status' => $profileData['verification_status'] ?? null
                ]);
            }
            
            // ✅ CRITICAL FIX: Ensure residency verification data is properly set
            // Prioritize profile data over resident data for residency verification fields
            if ($resident->profile) {
                if ($resident->profile->residency_verification_image) {
                    $profileData['residency_verification_image'] = $resident->profile->residency_verification_image;
                }
                if ($resident->profile->verification_status) {
                    $profileData['verification_status'] = $resident->profile->verification_status;
                }
                if ($resident->profile->denial_reason) {
                    $profileData['denial_reason'] = $resident->profile->denial_reason;
                }
                
                \Log::info('Profile show: Prioritized profile data for residency verification', [
                    'user_id' => $user->id,
                    'final_residency_image' => $profileData['residency_verification_image'] ?? null,
                    'final_verification_status' => $profileData['verification_status'] ?? null
                ]);
            }
            
            // Ensure the resident ID is correctly set (not overwritten by profile ID)
            $profileData['id'] = $residentId;
            // Keep the public resident_id string stable for frontend usage
            $profileData['resident_id'] = $resident->resident_id;
            
            // ✅ Ensure consistency for RequestDocuments.jsx (from resident data)
            if (!isset($profileData['avatar']) && isset($profileData['current_photo'])) {
                $profileData['avatar'] = $profileData['current_photo'];
            }
            
            // ✅ Add computed fields for better frontend compatibility
            $profileData['full_name'] = trim(($resident->first_name ?? '') . ' ' . 
                                             ($resident->middle_name ? $resident->middle_name . ' ' : '') . 
                                             ($resident->last_name ?? '') . 
                                             ($resident->name_suffix ? ' ' . $resident->name_suffix : ''));
            
            // ✅ Ensure address consistency
            $profileData['current_address'] = $profileData['current_address'] ?? $profileData['full_address'] ?? '';
            $profileData['address'] = $profileData['current_address'];
            
            // ✅ Ensure contact fields consistency
            $profileData['mobile_number'] = $profileData['mobile_number'] ?? $profileData['contact_number'] ?? '';
            
            // ✅ Ensure date fields consistency
            $profileData['date_of_birth'] = $profileData['birth_date'] ?? '';
            
            // ✅ Ensure gender/sex consistency
            $profileData['gender'] = $profileData['sex'] ?? '';
            
            // ✅ Ensure civil status consistency
            $profileData['civilStatus'] = $profileData['civil_status'] ?? '';
            
            // Ensure avatar field is properly mapped for frontend
            if (!isset($profileData['avatar']) && isset($profileData['current_photo'])) {
                $profileData['avatar'] = $profileData['current_photo'];
            }
            
            // Ensure verification_status prefers resident-level status when available
            $profileData['verification_status'] = $resident->verification_status
                ?? ($resident->profile ? $resident->profile->verification_status : ($profileData['verification_status'] ?? null));

            // ✅ CRITICAL FIX: Ensure profile_completed is boolean, not NULL
            $profileData['profile_completed'] = $resident->profile ? ($resident->profile->profile_completed ? true : false) : false;

            // Normalize permissions and flags so frontend has consistent shape
            if (!array_key_exists('permissions', $profileData)) {
                $profileData['permissions'] = $resident->profile && isset($resident->profile->permissions) ? $resident->profile->permissions : [];
            }
            if (!array_key_exists('my_benefits_enabled', $profileData)) {
                $profileData['my_benefits_enabled'] = $resident->profile && isset($resident->profile->my_benefits_enabled) ? (bool)$resident->profile->my_benefits_enabled : false;
            }

            // ✅ CRITICAL FIX: Check beneficiaries table for actual benefits status
            $benefitsStatus = $this->getBenefitsStatusFromBeneficiaries($resident);
            if ($benefitsStatus !== null) {
                $profileData['my_benefits_enabled'] = $benefitsStatus;
                // Also update permissions to ensure consistency
                $permissions = $profileData['permissions'] ?? [];
                if (is_string($permissions)) {
                    $permissions = json_decode($permissions, true) ?? [];
                }
                if (!is_array($permissions)) {
                    $permissions = (array) $permissions;
                }
                $permissions['my_benefits'] = $benefitsStatus;
                $profileData['permissions'] = $permissions;
                
                \Log::info('Benefits status updated from beneficiaries table', [
                    'resident_id' => $resident->id,
                    'benefits_enabled' => $benefitsStatus,
                    'source' => 'beneficiaries_table'
                ]);
            }

            \Log::info('Verification status resolution', [
                'user_id' => $user->id,
                'resident_verification_status' => $resident->verification_status ?? null,
                'profile_verification_status' => $resident->profile ? $resident->profile->verification_status : null,
                'final_verification_status' => $profileData['verification_status'] ?? null,
            ]);
            
            // DEBUG: Log the response structure
            \Log::info('Profile show response structure', [
                'user_id' => $user->id,
                'user_has_profile_relation' => $user->profile ? true : false,
                'resident_exists' => $resident ? true : false,
                'resident_has_profile' => $resident && $resident->profile ? true : false,
                'profile_data_keys' => array_keys($profileData),
                'avatar_value' => $profileData['avatar'] ?? 'not_set',
                'response_structure' => [
                    'user' => array_keys($user->toArray()),
                    'profile' => array_keys($profileData)
                ]
            ]);
            
            // FIX: Ensure user object includes profile data for frontend compatibility
            $userWithProfile = $user->toArray();
            $userWithProfile['profile'] = $profileData;
            
            \Log::info('Profile show: Returning profile data from residents table fallback', [
                'user_id' => $user->id,
                'profile_residency_image' => $profileData['residency_verification_image'] ?? 'NOT_SET',
                'profile_verification_status' => $profileData['verification_status'] ?? 'NOT_SET',
                'profile_keys' => array_keys($profileData)
            ]);
            
            return response()->json([
                'user' => $userWithProfile,
                'profile' => $profileData,
                'source' => 'residents_table_fallback',
                'profile_exists' => true,
            ]);
        } catch (\Exception $e) {
            \Log::error('Profile show failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error fetching profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get benefits status from beneficiaries table for a resident
     */
    private function getBenefitsStatusFromBeneficiaries($resident)
    {
        try {
            // Find beneficiaries that match this resident's name and have benefits enabled
            $beneficiaries = \App\Models\Beneficiary::where('my_benefits_enabled', true)
                ->where('status', 'Approved')
                ->where(function($query) use ($resident) {
                    // Match by name parts
                    $firstName = trim($resident->first_name);
                    $lastName = trim($resident->last_name);
                    
                    if ($firstName && $lastName) {
                        $query->where('name', 'LIKE', '%' . $firstName . '%')
                              ->where('name', 'LIKE', '%' . $lastName . '%');
                    }
                })
                ->get();

            \Log::info('Checking beneficiaries for resident', [
                'resident_id' => $resident->id,
                'resident_name' => $resident->first_name . ' ' . $resident->last_name,
                'beneficiaries_found' => $beneficiaries->count(),
                'beneficiaries' => $beneficiaries->pluck('name', 'id')->toArray()
            ]);

            // If any approved beneficiary with benefits enabled is found, return true
            if ($beneficiaries->count() > 0) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            \Log::error('Error checking beneficiaries status', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    // 🧾 Admin: View single resident by ID
    public function showById($id)
    {
        try {
            $resident = Resident::with('profile', 'user')->find($id);

            if (!$resident) {
                return response()->json(['message' => 'Resident not found.'], 404);
            }

            return response()->json(['resident' => $resident], 200);
        } catch (\Exception $e) {
            Log::error('Failed to fetch resident by ID', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error fetching resident.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // 🆕 Create new resident profile
    public function store(Request $request)
    {
        try {
            // ✅ Use authenticated user or admin-supplied user_id
            $userId = $request->input('user_id') ?? Auth::id();

            if (!$userId) {
                return response()->json(['message' => 'User ID is required.'], 400);
            }

            // ❌ Check for existing profiles - redirect to update if profile exists
            $existingResident = Resident::where('user_id', $userId)->first();
            $existingProfile = \App\Models\Profile::where('user_id', $userId)->first();
            
            if ($existingProfile) {
                \Log::info('Profile already exists, updating instead of creating', [
                    'user_id' => $userId,
                    'resident_id' => $existingResident ? $existingResident->id : null,
                    'profile_id' => $existingProfile->id
                ]);
                
                // If profile exists, update it instead
                if ($existingResident) {
                    return $this->updateExistingProfile($request, $existingResident);
                } else {
                    // Create resident and link to existing profile
                    $request->merge(['existing_profile_id' => $existingProfile->id]);
                    // Continue with store method but link to existing profile
                }
            }
            
            // Clean up any duplicate residents for this user before creating new profile
            if ($existingResident) {
                $duplicateResidents = Resident::where('user_id', $userId)
                    ->where('id', '!=', $existingResident->id)
                    ->get();
                
                if ($duplicateResidents->count() > 0) {
                    \Log::info('Cleaning up duplicate residents before creating profile', [
                        'user_id' => $userId,
                        'keeping_resident_id' => $existingResident->id,
                        'deleting_count' => $duplicateResidents->count()
                    ]);
                    
                    foreach ($duplicateResidents as $duplicate) {
                        if ($duplicate->profile) {
                            $duplicate->profile->delete();
                        }
                        $duplicate->delete();
                    }
                }
            }

            // More flexible validation - make most fields nullable for updates
            $validated = $request->validate([
                'first_name' => 'nullable|string',
                'last_name' => 'nullable|string',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string',
                'age' => 'nullable|integer',
                'email' => 'nullable|email',
                'mobile_number' => 'nullable|string',
                'sex' => 'nullable|string',
                'civil_status' => 'nullable|string',
                'religion' => 'nullable|string',
                'current_address' => 'nullable|string',
                'years_in_barangay' => 'nullable|integer',
                'voter_status' => 'nullable|string',
                'head_of_family' => 'nullable|boolean',
                'current_photo' => 'nullable', // Allow both file uploads and strings
                'residency_verification_image' => 'nullable|string',

                // Optional
                'middle_name' => 'nullable|string',
                'name_suffix' => 'nullable|string',
                'nationality' => 'nullable|string',
                'relation_to_head' => 'nullable|string',
                'voters_id_number' => 'nullable|string',
                'voting_location' => 'nullable|string',
                'housing_type' => 'nullable|string',
                'household_no' => 'nullable|string',
                'classified_sector' => 'nullable|string',
                'educational_attainment' => 'nullable|string',
                'occupation_type' => 'nullable|string',
                'salary_income' => 'nullable|string',
                'business_info' => 'nullable|string',
                'business_type' => 'nullable|string',
                'business_location' => 'nullable|string',
                'business_outside_barangay' => 'nullable|boolean',
                'special_categories' => 'nullable|array',
                'covid_vaccine_status' => 'nullable|string',
                'vaccine_received' => 'nullable|array',
                'other_vaccine' => 'nullable|string',
                'year_vaccinated' => 'nullable|integer',
            ]);
            
            // Validate current_photo separately if it's a file upload
            if ($request->hasFile('current_photo')) {
                $request->validate([
                    'current_photo' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048'
                ]);
            }

            // Get all fillable data and provide safe defaults for required fields
            $fillable = (new Profile)->getFillable();
            $data = [];
            foreach ($fillable as $field) {
                // Use request input with safe default for each field
                switch ($field) {
                    case 'contact_number':
                        $data[$field] = $request->input($field, 'Not provided');
                        break;
                    case 'first_name':
                        $data[$field] = $request->input($field, 'Unknown');
                        break;
                    case 'last_name':
                        $data[$field] = $request->input($field, 'Unknown');
                        break;
                    case 'email':
                        $data[$field] = $request->input($field, 'noemail@example.com');
                        break;
                    case 'birth_date':
                        $data[$field] = $request->input($field, now()->subYears(18)->format('Y-m-d'));
                        break;
                    case 'birth_place':
                        $data[$field] = $request->input($field, 'Unknown');
                        break;
                    case 'age':
                        $data[$field] = $request->input($field, 18);
                        break;
                    case 'sex':
                        $data[$field] = $request->input($field, 'Not specified');
                        break;
                    case 'civil_status':
                        $data[$field] = $request->input($field, 'Single');
                        break;
                    case 'religion':
                        $data[$field] = $request->input($field, 'Not specified');
                        break;
                    case 'years_in_barangay':
                        $data[$field] = $request->input($field, 0);
                        break;
                    case 'voter_status':
                        $data[$field] = $request->input($field, 'Not registered');
                        break;
                    case 'head_of_family':
                        $data[$field] = $request->boolean($field);
                        break;
                    case 'business_outside_barangay':
                        $data[$field] = $request->boolean($field);
                        break;
                    case 'special_categories':
                        $data[$field] = $request->input($field, []);
                        break;
                    case 'vaccine_received':
                        $data[$field] = $request->input($field, []);
                        break;
                    default:
                        $data[$field] = $request->input($field, null);
                }
            }
            // Handle residency verification image upload
            if ($request->hasFile('residency_verification_image')) {
                $data['residency_verification_image'] = $request->file('residency_verification_image')->store('residency_verification_images', 'public');
            }
            // Handle photo upload - only process if it's a file upload, not a string
            if ($request->hasFile('current_photo')) {
                $data['current_photo'] = $request->file('current_photo')->store('avatars', 'public');
            } else if ($request->has('current_photo') && is_string($request->input('current_photo'))) {
                // If current_photo is provided as a string (existing photo path), keep it
                $data['current_photo'] = $request->input('current_photo');
            }

            // Check if we should use existing profile
            $existingProfileId = $request->input('existing_profile_id');
            if ($existingProfileId) {
                $profile = \App\Models\Profile::find($existingProfileId);
                if ($profile) {
                    $profile->update($data);
                    \Log::info('Updated existing profile instead of creating new one', [
                        'profile_id' => $profile->id,
                        'user_id' => $userId
                    ]);
                } else {
                    // Only generate $residentsId and set resident_id when creating a new profile
                    $residentsId = 'RES-' . now()->format('YmdHis') . '-' . strtoupper(substr($validated['last_name'], 0, 3));
                    $data['resident_id'] = $residentsId;
                    $profile = new Profile($data);
                    $profile->user_id = $userId;
                    $profile->save();
                }
            } else {
                $residentsId = 'RES-' . now()->format('YmdHis') . '-' . strtoupper(substr($validated['last_name'], 0, 3));
                $data['resident_id'] = $residentsId;
                $profile = new Profile($data);
                $profile->user_id = $userId;
                $profile->save();
            }

            // Custom validation: Profile photo is required (either new upload or existing photo)
            $hasNewPhoto = $request->hasFile('current_photo');
            $hasExistingPhoto = $request->has('current_photo') && !empty(trim($request->input('current_photo')));
            $hasProfilePhoto = !empty($profile->current_photo);
            
            if (!$hasNewPhoto && !$hasExistingPhoto && !$hasProfilePhoto) {
                return response()->json([
                    'message' => 'Profile photo is required',
                    'errors' => [
                        'current_photo' => ['Profile photo is required to complete your profile.']
                    ]
                ], 422);
            }

            // Set profile_completed if all required fields are filled and verification_status is approved
            $requiredFields = ['first_name','last_name','birth_date','sex','civil_status','religion','current_address','years_in_barangay','voter_status','housing_type','classified_sector','educational_attainment','occupation_type','salary_income','current_photo'];
            $isComplete = true;
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (empty($profile->$field)) {
                    $isComplete = false;
                    $missingFields[] = $field;
                }
            }
            if (!$isComplete) {
                \Log::warning('Profile NOT completed for user_id ' . $userId . '. Missing fields:', [
                    'missing_fields' => $missingFields,
                    'profile_id' => $profile->id,
                    'profile_data' => $profile->toArray()
                ]);
            } else {
                \Log::info('Profile completed for user_id ' . $userId . '. All required fields present.');
            }
            if ($profile->verification_status === 'approved' && $isComplete) {
                $profile->profile_completed = true;
                $profile->save();
            } else {
                $profile->profile_completed = false;
                $profile->save();
            }

            // After saving profile, update resident with all profile fields except residents_id
            $residentData = $profile->toArray();
            unset($residentData['resident_id']);
            // Ensure mobile_number is set in resident (no mapping needed if field matches)
            $resident = Resident::where('user_id', $userId)->first();
            if ($resident) {
                $resident->fill($residentData);
                $resident->profile_id = $profile->id;
                $resident->save();
            } else {
                $resident = new Resident($residentData);
                $resident->user_id = $userId;
                $resident->profile_id = $profile->id;
                // Set resident_id to match profile's resident_id
                $resident->resident_id = $profile->resident_id;
                $resident->save();
            }

            $user = Auth::user();
            // Temporarily disable notification to prevent email configuration errors
            // $user->notify(new ProfileUpdatedNotification($profile, $resident));

            return response()->json([
                'message' => 'Profile and Resident created successfully.',
                'resident_id' => $profile->resident_id ?? ($resident->resident_id ?? null),
                'profile' => $profile,
                'resident' => $resident,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Profile store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Handle specific database constraint violations
            if (strpos($e->getMessage(), 'Integrity constraint violation') !== false) {
                if (strpos($e->getMessage(), 'user_id') !== false) {
                    return response()->json([
                        'message' => 'This user already has a resident profile',
                        'error' => 'User already has a profile. Please update the existing profile instead of creating a new one.'
                    ], 409); // Conflict status code
                } elseif (strpos($e->getMessage(), 'resident_id') !== false) {
                    return response()->json([
                        'message' => 'Resident ID already exists',
                        'error' => 'The generated resident ID already exists. Please try again.'
                    ], 409);
                }
            }
            
            return response()->json([
                'message' => 'Failed to create profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✏️ Update existing profile
    public function update(Request $request)
    {
        try {
            $user = $request->user();
            
            \Log::info('Profile update attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'has_current_photo_file' => $request->hasFile('current_photo')
            ]);
            
            // Try to find existing resident - use first() to get the first one if duplicates exist
            $resident = \App\Models\Resident::where('user_id', $user->id)->first();
            
            // If no resident exists, create both resident and profile
            if (!$resident) {
                \Log::info('No resident found, creating new profile via store method');
                return $this->store($request);
            }
            
            // Clean up any duplicate residents for this user (keep the first one)
            $duplicateResidents = \App\Models\Resident::where('user_id', $user->id)
                ->where('id', '!=', $resident->id)
                ->get();
            
            if ($duplicateResidents->count() > 0) {
                \Log::info('Found duplicate residents, cleaning up', [
                    'user_id' => $user->id,
                    'keeping_resident_id' => $resident->id,
                    'deleting_count' => $duplicateResidents->count()
                ]);
                
                foreach ($duplicateResidents as $duplicate) {
                    // Delete associated profiles if they exist
                    if ($duplicate->profile) {
                        $duplicate->profile->delete();
                    }
                    $duplicate->delete();
                }
            }
            
            // Check for existing profile both through resident relationship and directly by user_id
            $profile = $resident->profile;
            if (!$profile) {
                // Also check if there's a profile directly by user_id
                $profile = \App\Models\Profile::where('user_id', $user->id)->first();
            }

            // If resident exists but no profile, create profile and link it
            if (!$profile) {
                \Log::info('Resident exists but no profile, creating profile and linking');
                return $this->store($request);
            } else if (!$resident->profile_id && $profile) {
                // If profile exists but not linked to resident, link them
                \Log::info('Profile exists but not linked to resident, linking them', [
                    'resident_id' => $resident->id,
                    'profile_id' => $profile->id
                ]);
                $resident->profile_id = $profile->id;
                $resident->save();
            }
            
            \Log::info('Updating existing profile', [
                'resident_id' => $resident->id,
                'profile_id' => $profile->id
            ]);

            // Enhanced validation for updates - enforce required fields based on requirements
            // Note: current_photo can be either a file upload OR a string (existing photo path)
            $validated = $request->validate([
                // Personal Information - Required fields (except middle_name and name_suffix)
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'birth_date' => 'required|date|before:today',
                'birth_place' => 'required|string|max:255',
                'age' => 'nullable|integer|min:0|max:150',
                'email' => 'required|email|max:255',
                'contact_number' => 'nullable|string|max:20',
                'mobile_number' => 'required|string|regex:/^09[0-9]{9}$/|max:11',
                'sex' => 'required|string|in:Male,Female,Other',
                'civil_status' => 'required|string|in:Single,Married,Widow,Separated',
                'religion' => 'required|string|max:255',
                'nationality' => 'required|string|max:255',
                'relation_to_head' => 'required|string|max:255',
                
                // Address Information - Required fields (except housing_type)
                'current_address' => 'required|string|max:500',
                'years_in_barangay' => 'required|integer|min:0|max:100',
                'head_of_family' => 'nullable|boolean',
                
                // Education & Employment - Required fields (except business fields)
                'classified_sector' => 'required|string|max:255',
                'educational_attainment' => 'required|string|max:255',
                'occupation_type' => 'required|string|max:255',
                'salary_income' => 'required|string|max:255',
                
                // Voter Information - All fields required
                'voter_status' => 'required|string|max:255',
                'voters_id_number' => 'required|string|max:255',
                'voting_location' => 'required|string|max:255',
                
                // Profile Photo - Required
                'current_photo' => 'nullable', // Handle file upload separately
                'residency_verification_image' => 'nullable|string',

                // Optional fields
                'middle_name' => 'nullable|string|max:255',
                'name_suffix' => 'nullable|string|in:none,Jr.,Sr.,II,III,IV',
                'housing_type' => 'nullable|string|max:255',
                
                // Business Information - Optional fields
                'business_info' => 'nullable|string|max:255',
                'business_type' => 'nullable|string|max:255',
                'business_location' => 'nullable|string|max:255',
                'business_outside_barangay' => 'nullable|boolean',
                
                // Special Categories - Optional
                'special_categories' => 'nullable|array',
                'special_categories.*' => 'string|max:255',
                
                // COVID Vaccination - Optional
                'covid_vaccine_status' => 'nullable|string|max:255',
                'other_vaccine' => 'nullable|string|max:255',
                'year_vaccinated' => 'nullable|string|max:4',
                'household_no' => 'nullable|string|max:50',
            ]);
            
            // Validate current_photo separately if it's a file upload
            if ($request->hasFile('current_photo')) {
                $request->validate([
                    'current_photo' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048'
                ]);
            }
            
            // Custom validation: Profile photo is required (either new upload or existing photo)
            $hasNewPhoto = $request->hasFile('current_photo');
            $hasExistingPhoto = $request->has('current_photo') && !empty(trim($request->input('current_photo')));
            $hasProfilePhoto = !empty($profile->current_photo);
            
            \Log::info('Profile photo validation debug', [
                'hasNewPhoto' => $hasNewPhoto,
                'hasExistingPhoto' => $hasExistingPhoto,
                'hasProfilePhoto' => $hasProfilePhoto,
                'current_photo_input' => $request->input('current_photo'),
                'profile_current_photo' => $profile->current_photo,
                'request_has_current_photo' => $request->has('current_photo')
            ]);
            
            if (!$hasNewPhoto && !$hasExistingPhoto && !$hasProfilePhoto) {
                return response()->json([
                    'message' => 'Profile photo is required',
                    'errors' => [
                        'current_photo' => ['Profile photo is required to complete your profile.']
                    ]
                ], 422);
            }

            // Get all fillable data - for updates, only update provided fields safely
            $fillable = (new Profile)->getFillable();
            $data = [];
            foreach ($fillable as $field) {
                if ($request->has($field)) {
                    switch ($field) {
                        case 'head_of_family':
                        case 'business_outside_barangay':
                            $data[$field] = $request->boolean($field);
                            break;
                        case 'special_categories':
                        case 'vaccine_received':
                            $data[$field] = $request->input($field, []);
                            break;
                        default:
                            $data[$field] = $request->input($field);
                    }
                }
            }
            // Handle residency verification image upload
            if ($request->hasFile('residency_verification_image')) {
                $data['residency_verification_image'] = $request->file('residency_verification_image')->store('residency_verification_images', 'public');
            }
            // Handle photo upload - only process if it's a file upload, not a string
            if ($request->hasFile('current_photo')) {
                $photoPath = $request->file('current_photo')->store('avatars', 'public');
                $data['current_photo'] = $photoPath;
            } else if ($request->has('current_photo') && is_string($request->input('current_photo'))) {
                // If current_photo is provided as a string (existing photo path), keep it
                $data['current_photo'] = $request->input('current_photo');
            }
            $profile->update($data);

            // Set profile_completed if all required fields are filled and verification_status is approved
            $requiredFields = ['first_name','last_name','birth_date','sex','civil_status','religion','current_address','years_in_barangay','voter_status','housing_type','classified_sector','educational_attainment','occupation_type','salary_income','current_photo'];
            $isComplete = true;
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (empty($profile->$field)) {
                    $isComplete = false;
                    $missingFields[] = $field;
                }
            }
            if (!$isComplete) {
                \Log::warning('Profile NOT completed for user_id ' . $user->id . '. Missing fields:', [
                    'missing_fields' => $missingFields,
                    'profile_id' => $profile->id,
                    'profile_data' => $profile->toArray()
                ]);
            } else {
                \Log::info('Profile completed for user_id ' . $user->id . '. All required fields present.');
            }
            if ($profile->verification_status === 'approved' && $isComplete) {
                $profile->profile_completed = true;
                $profile->save();
            } else {
                $profile->profile_completed = false;
                $profile->save();
            }

            // Remove residents_id from resident creation/update
            $residentData = $data;
            unset($residentData['resident_id']);
            // Only use mobile_number, do not map to contact_number
            $resident->fill($residentData);
            $resident->user_id = $user->id;
            $resident->profile_id = $profile->id;
            $resident->save();

            // Temporarily disable notification to prevent email configuration errors
            // $user->notify(new \App\Notifications\ProfileUpdatedNotification($profile, $resident));

            return response()->json([
                'message' => 'Profile and Resident updated successfully.',
                'profile' => $profile->fresh(),
                'resident' => $resident,
                'user' => $user->fresh('profile'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Profile update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to update existing profile (called from store when profile exists)
     */

    private function updateExistingProfile(Request $request, $resident)
    {
        try {
            $user = $request->user();
            $profile = $resident->profile;

            // Flexible validation for updates - all fields nullable
            $validated = $request->validate([
                'first_name' => 'nullable|string',
                'last_name' => 'nullable|string',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string',
                'age' => 'nullable|integer',
                'email' => 'nullable|email',
                'contact_number' => 'nullable|string',
                'sex' => 'nullable|string',
                'civil_status' => 'nullable|string',
                'religion' => 'nullable|string',
                'current_address' => 'nullable|string',
                'years_in_barangay' => 'nullable|integer',
                'voter_status' => 'nullable|string',
                'head_of_family' => 'nullable|boolean',
                'current_photo' => 'nullable', // Allow both file uploads and strings
                'residency_verification_image' => 'nullable|string',

                // Optional fields
                'middle_name' => 'nullable|string',
                'name_suffix' => 'nullable|string',
                'nationality' => 'nullable|string',
                'relation_to_head' => 'nullable|string',
                'voters_id_number' => 'nullable|string',
                'voting_location' => 'nullable|string',
                'housing_type' => 'nullable|string',
                'household_no' => 'nullable|string',
                'classified_sector' => 'nullable|string',
                'educational_attainment' => 'nullable|string',
                'occupation_type' => 'nullable|string',
                'salary_income' => 'nullable|string',
                'business_info' => 'nullable|string',
                'business_type' => 'nullable|string',
                'business_location' => 'nullable|string',
                'business_outside_barangay' => 'nullable|boolean',
                'special_categories' => 'nullable|array',
                'covid_vaccine_status' => 'nullable|string',
                'vaccine_received' => 'nullable|array',
                'other_vaccine' => 'nullable|string',
                'year_vaccinated' => 'nullable|integer',
            ]);
            
            // Validate current_photo separately if it's a file upload
            if ($request->hasFile('current_photo')) {
                $request->validate([
                    'current_photo' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048'
                ]);
            }

            // Get all fillable data - for updates, only update provided fields
            $data = array_filter($request->only((new Profile)->getFillable()), function($value) {
                return $value !== null && $value !== '';
            });
            
            // Handle residency verification image upload
            if ($request->hasFile('residency_verification_image')) {
                $data['residency_verification_image'] = $request->file('residency_verification_image')->store('residency_verification_images', 'public');
            }
            
            // Handle boolean fields explicitly
            if ($request->has('head_of_family')) {
                $data['head_of_family'] = $request->boolean('head_of_family');
            }
            if ($request->has('business_outside_barangay')) {
                $data['business_outside_barangay'] = $request->boolean('business_outside_barangay');
            }
            
            // Handle array fields
            $data['special_categories'] = $request->input('special_categories', []);
            $data['vaccine_received'] = $request->input('vaccine_received', []);

            // Handle photo upload - only process if it's a file upload, not a string
            if ($request->hasFile('current_photo')) {
                $photoPath = $request->file('current_photo')->store('avatars', 'public');
                $data['current_photo'] = $photoPath;
            } else if ($request->has('current_photo') && is_string($request->input('current_photo'))) {
                // If current_photo is provided as a string (existing photo path), keep it
                $data['current_photo'] = $request->input('current_photo');
            }

            $profile->update($data);

            // Remove residents_id from resident creation/update
            $residentData = $data;
            unset($residentData['resident_id']);
            // Map mobile_number from profile to contact_number in resident
            if (isset($residentData['mobile_number'])) {
                $residentData['contact_number'] = $residentData['mobile_number'];
            }
            $resident->fill($residentData);
            $resident->user_id = $user->id;
            $resident->profile_id = $profile->id;
            $resident->save();

            // Temporarily disable notification to prevent email configuration errors
            // $user->notify(new \App\Notifications\ProfileUpdatedNotification($profile, $resident));

            return response()->json([
                'message' => 'Profile updated successfully.',
                'profile' => $profile->fresh(),
                'resident' => $resident->fresh(),
                'user' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            \Log::error('updateExistingProfile failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'An error occurred while updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // ✅ Approve residency verification
    public function approveVerification($id)
    {
        try {
            // Validate the ID parameter
            if (!$id || !is_numeric($id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid resident ID provided.'
                ], 400);
            }
            
            \DB::beginTransaction();
            
            // First try to find by profile ID
            $profile = Profile::find($id);
            $resident = null;
            
            if ($profile) {
                // Update profile verification status
                $profile->verification_status = 'approved';
                $profile->denial_reason = null;
                // Ensure profile_completed is set to false when approved (user needs to complete profile)
                $profile->profile_completed = false;
                $profile->save();
                
                // Find resident record by user_id first, then by profile_id
                $resident = Resident::where('user_id', $profile->user_id)->first();
                if (!$resident) {
                    $resident = Resident::where('profile_id', $profile->id)->first();
                }
                if (!$resident) {
                    $resident = Resident::find($id);
                }
                
                // If resident doesn't exist, create one
                if (!$resident) {
                    $resident = new Resident();
                    $resident->user_id = $profile->user_id;
                    $resident->profile_id = $profile->id;
                    $resident->resident_id = $profile->resident_id;
                }
                
                // Update resident verification status
                $resident->verification_status = 'approved';
                $resident->denial_reason = null;
                $resident->save();
                
                \Log::info('Approval: Updated both profile and resident', [
                    'profile_id' => $profile->id,
                    'resident_id' => $resident->id,
                    'user_id' => $profile->user_id,
                    'profile_status' => $profile->verification_status,
                    'resident_status' => $resident->verification_status
                ]);
                
                // Force refresh relations
                $profile = $profile->fresh();
                $resident = $resident->fresh();
                
                // Notify the user
                if ($profile->user) {
                    $profile->user->notify(new ResidencyVerificationApproved($profile->user));
                }
                
                \DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Residency verification approved successfully.',
                    'profile' => $profile,
                    'resident' => $resident
                ], 200);
            }
            
            // If no profile found, try to find resident directly
            $resident = Resident::with('profile')->find($id);
            if ($resident) {
                try {
                    // Update resident
                    $resident->verification_status = 'approved';
                    $resident->denial_reason = null;
                    $resident->save();
                    
                    // Update or create profile
                    if ($resident->profile) {
                        $resident->profile->verification_status = 'approved';
                        $resident->profile->denial_reason = null;
                        $resident->profile->profile_completed = false;
                        $resident->profile->save();
                    } else if ($resident->user_id) {
                        $profile = new Profile();
                        $profile->user_id = $resident->user_id;
                        $profile->verification_status = 'approved';
                        $profile->resident_id = $resident->resident_id;
                        $profile->profile_completed = false;
                        $profile->save();
                        
                        $resident->profile_id = $profile->id;
                        $resident->save();
                        
                        // Refresh the resident to get the new profile relation
                        $resident = $resident->fresh('profile');
                    }
                    
                    \Log::info('Approval: Updated resident and profile', [
                        'resident_id' => $resident->id,
                        'user_id' => $resident->user_id,
                        'resident_status' => $resident->verification_status,
                        'profile_status' => $resident->profile ? $resident->profile->verification_status : 'N/A'
                    ]);
                    
                    // Force refresh the resident with profile relation
                    $resident = $resident->fresh('profile');
                    
                    // Notify the user
                    if ($resident->user) {
                        try {
                            $resident->user->notify(new ResidencyVerificationApproved($resident->user));
                        } catch (\Exception $notificationError) {
                            \Log::warning('Failed to send approval notification', [
                                'user_id' => $resident->user_id,
                                'error' => $notificationError->getMessage()
                            ]);
                        }
                    }
                    
                    \DB::commit();
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Residency verification approved successfully.',
                        'resident' => $resident,
                        'profile' => $resident->profile
                    ], 200);
                } catch (\Exception $e) {
                    \DB::rollBack();
                    throw $e;
                }
            }
            
            return response()->json([
                'success' => false,
                'message' => 'No resident or profile found with the provided ID.'
            ], 404);
        } catch (\Exception $e) {
            if (\DB::transactionLevel() > 0) {
                \DB::rollBack();
            }
            
            \Log::error('Residency verification approval failed', [
                'resident_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve residency verification.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // ❌ Deny residency verification
    public function denyVerification(Request $request, $id)
    {
        try {
            \Log::info('Deny verification called', [
                'id' => $id,
                'request_data' => $request->all()
            ]);
            
            // Accept either resident id OR profile id for flexibility
            $resident = Resident::find($id);
            if (!$resident) {
                $resident = Resident::where('profile_id', $id)->first();
            }
            
            \Log::info('Resident lookup result', [
                'id' => $id,
                'resident_found' => $resident ? $resident->id : null,
                'resident_profile_id' => $resident ? $resident->profile_id : null
            ]);
            
            if (!$resident) {
                // Fallback: update Profile verification if Resident does not yet exist
                $profile = Profile::find($id);
                \Log::info('Profile fallback lookup', [
                    'id' => $id,
                    'profile_found' => $profile ? $profile->id : null,
                    'profile_user_id' => $profile ? $profile->user_id : null
                ]);
                
                if ($profile) {
                    $request->validate([
                        'comment' => 'required|string|max:500'
                    ]);
                    // Store the old image path before clearing it
                    $oldImagePath = $profile->residency_verification_image;
                    
                    $profile->verification_status = 'denied';
                    $profile->denial_reason = $request->input('comment');
                    $profile->residency_verification_image = null; // Clear the uploaded image
                    $profile->save();
                    
                    // Delete the physical image file from storage
                    if ($oldImagePath) {
                        try {
                            \Storage::disk('public')->delete($oldImagePath);
                            \Log::info('Deleted profile verification image (fallback)', ['path' => $oldImagePath]);
                        } catch (\Exception $e) {
                            \Log::warning('Failed to delete profile verification image (fallback)', [
                                'path' => $oldImagePath,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    // Try to email profile user
                    $user = $profile->user;
                    if ($user && $user->email) {
                        try {
                            Mail::to($user->email)->send(new ResidencyVerificationDeniedMail($user, $request->input('comment')));
                        } catch (\Exception $e) {
                            \Log::warning('Failed to send profile-level denial email', [
                                'user_id' => $user->id,
                                'profile_id' => $profile->id,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    return response()->json([
                        'message' => 'Residency verification denied successfully (profile-level).',
                        'profile' => $profile
                    ], 200);
                }
                return response()->json(['message' => 'Resident not found.'], 404);
            }
            
            // Validate comment is provided
            $request->validate([
                'comment' => 'required|string|max:500'
            ]);
            
            \Log::info('Processing resident denial', [
                'resident_id' => $resident->id,
                'current_image' => $resident->residency_verification_image,
                'profile_image' => $resident->profile ? $resident->profile->residency_verification_image : null
            ]);
            
            // Store the old image path before clearing it
            $oldImagePath = $resident->residency_verification_image;
            $oldProfileImagePath = $resident->profile ? $resident->profile->residency_verification_image : null;
            
            // Update verification status and clear the uploaded image
            $resident->verification_status = 'denied';
            $resident->denial_reason = $request->input('comment');
            $resident->residency_verification_image = null; // Clear the uploaded image
            $resident->save();
            
            // Keep profile in sync if it exists
            if ($resident->profile) {
                $resident->profile->verification_status = 'denied';
                $resident->profile->denial_reason = $request->input('comment');
                $resident->profile->residency_verification_image = null; // Clear the uploaded image
                $resident->profile->save();
            }
            
            // Delete the physical image files from storage
            if ($oldImagePath) {
                try {
                    \Storage::disk('public')->delete($oldImagePath);
                    \Log::info('Deleted resident verification image', ['path' => $oldImagePath]);
                } catch (\Exception $e) {
                    \Log::warning('Failed to delete resident verification image', [
                        'path' => $oldImagePath,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            if ($oldProfileImagePath && $oldProfileImagePath !== $oldImagePath) {
                try {
                    \Storage::disk('public')->delete($oldProfileImagePath);
                    \Log::info('Deleted profile verification image', ['path' => $oldProfileImagePath]);
                } catch (\Exception $e) {
                    \Log::warning('Failed to delete profile verification image', [
                        'path' => $oldProfileImagePath,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Send email notification to resident
            $user = $resident->user;
            if ($user && $user->email) {
                \Log::info('Sending residency verification denial email', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'resident_id' => $resident->id
                ]);
                
                try {
                    Mail::to($user->email)->send(new ResidencyVerificationDeniedMail($user, $request->input('comment')));
                } catch (\Exception $e) {
                    \Log::error('Failed to send residency verification denial email', [
                        'user_id' => $user->id,
                        'resident_id' => $resident->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            return response()->json([
                'message' => 'Residency verification denied successfully.',
                'resident' => $resident
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Residency verification denial failed', [
                'resident_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to deny residency verification.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 📤 Upload residency verification image only
    public function uploadResidencyVerification(Request $request)
    {
        try {
            $user = $request->user();
            
            \Log::info('Residency verification upload attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'has_file' => $request->hasFile('residency_verification_image'),
                'file_size' => $request->hasFile('residency_verification_image') ? $request->file('residency_verification_image')->getSize() : null
            ]);
            
            // Validate the image
            $request->validate([
                'residency_verification_image' => 'required|image|mimes:jpeg,png,jpg|max:5120' // 5MB max
            ]);
            // Check if profile already exists
            $profile = Profile::where('user_id', $user->id)->first();
            if (!$profile) {
                // Create a minimal profile for residency verification with safe defaults
                $profile = new Profile();
                $profile->user_id = $user->id;
                $profile->email = $user->email;
                $profile->verification_status = 'pending';
                // Generate a unique resident_id using user_id and timestamp
                $profile->resident_id = 'R-' . $user->id . '-' . time();
                
                // Set safe defaults for any required fields that might still be NOT NULL
                $profile->first_name = 'Pending';
                $profile->last_name = 'Verification';
                $profile->birth_date = \Carbon\Carbon::now()->subYears(18)->format('Y-m-d');
                $profile->birth_place = 'Not specified';
                $profile->age = 18;
                $profile->sex = 'Not specified';
                $profile->civil_status = 'Not specified';
                $profile->religion = 'Not specified';
                
                $profile->save();
                \Log::info('Created new profile for residency verification', [
                    'user_id' => $user->id,
                    'profile_id' => $profile->id
                ]);
            }
            // Initialize imagePath variable
            $imagePath = null;
            
            // Handle image upload
            if ($request->hasFile('residency_verification_image')) {
                // Delete old image if exists
                if ($profile->residency_verification_image) {
                    \Storage::disk('public')->delete($profile->residency_verification_image);
                }
                // Store new image
                try {
                    $imagePath = $request->file('residency_verification_image')->store('residency_verification_images', 'public');
                    \Log::info('Image stored successfully', [
                        'user_id' => $user->id,
                        'image_path' => $imagePath
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to store image', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                    throw new \Exception('Failed to store image: ' . $e->getMessage());
                }
                
                $profile->residency_verification_image = $imagePath;
                $profile->verification_status = 'pending'; // Reset to pending for review
                $profile->denial_reason = null; // Clear any previous denial reason
                $profile->save();
                
                // ✅ CRITICAL FIX: Synchronize residency verification data to residents table
                $resident = \App\Models\Resident::where('user_id', $user->id)->first();
                if ($resident) {
                    $resident->residency_verification_image = $imagePath;
                    $resident->verification_status = 'pending';
                    $resident->denial_reason = null;
                    $resident->save();
                    
                    \Log::info('Synchronized residency verification data to residents table', [
                        'user_id' => $user->id,
                        'resident_id' => $resident->id,
                        'profile_id' => $profile->id,
                        'image_path' => $imagePath
                    ]);
                } else {
                    // If no resident exists, create one to ensure data consistency
                    $resident = new \App\Models\Resident();
                    $resident->user_id = $user->id;
                    $resident->profile_id = $profile->id;
                    $resident->resident_id = $profile->resident_id;
                    $resident->residency_verification_image = $imagePath;
                    $resident->verification_status = 'pending';
                    $resident->denial_reason = null;
                    
                    // Set required fields from profile data
                    $resident->first_name = $profile->first_name ?? 'Pending';
                    $resident->last_name = $profile->last_name ?? 'Verification';
                    $resident->birth_date = $profile->birth_date ? $profile->birth_date : \Carbon\Carbon::now()->subYears(18)->format('Y-m-d');
                    $resident->birth_place = $profile->birth_place ?? 'Not specified';
                    $resident->age = $profile->age ?? 18;
                    $resident->sex = $profile->sex ?? 'Not specified';
                    $resident->civil_status = $profile->civil_status ?? 'Not specified';
                    $resident->religion = $profile->religion ?? 'Not specified';
                    $resident->email = $profile->email ?? $user->email;
                    
                    $resident->save();
                    
                    \Log::info('Created new resident record for residency verification', [
                        'user_id' => $user->id,
                        'resident_id' => $resident->id,
                        'profile_id' => $profile->id,
                        'image_path' => $imagePath
                    ]);
                }
                
                \Log::info('Residency verification image uploaded successfully', [
                    'user_id' => $user->id,
                    'profile_id' => $profile->id,
                    'image_path' => $imagePath
                ]);
                
                // Notify all admins (with error handling)
                try {
                    $admins = \App\Models\User::where('role', 'admin')->get();
                    foreach ($admins as $admin) {
                        $admin->notify(new \App\Notifications\ResidencyVerificationReuploaded($user));
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to send admin notifications', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                    // Don't fail the upload if notifications fail
                }
                
                return response()->json([
                    'message' => 'Residency verification image uploaded successfully. Please wait for admin approval.',
                    'profile' => $profile->fresh(),
                    'image_path' => $imagePath
                ], 200);
            } else {
                return response()->json([
                    'message' => 'No image file provided.',
                    'error' => 'No image file was uploaded.'
                ], 400);
            }
            
        } catch (\Exception $e) {
            \Log::error('Residency verification upload failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to upload residency verification image.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}