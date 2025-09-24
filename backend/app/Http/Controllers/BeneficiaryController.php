<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BeneficiaryController extends Controller
{
    /**
     * Get enabled beneficiaries for the My Benefits section
     */
    public function getMyBenefits(Request $request)
    {
        $user = $request->user();
        
        // Find the resident record for the current user
        $resident = \App\Models\Resident::where('user_id', $user->id)->first();
        
        if (!$resident) {
            return response()->json([
                'message' => 'No resident profile found for this user',
                'benefits' => []
            ]);
        }

        // Get benefits for this resident that are enabled and approved
        $benefits = Beneficiary::with(['program'])
            ->where('my_benefits_enabled', true)
            ->where('status', 'Approved')
            ->where(function($query) use ($resident) {
                // More flexible name matching
                $firstName = trim($resident->first_name);
                $lastName = trim($resident->last_name);
                
                $query->where(function($q) use ($firstName, $lastName) {
                    // Match first name AND last name in any order
                    $q->where('name', 'LIKE', '%' . $firstName . '%')
                      ->where('name', 'LIKE', '%' . $lastName . '%');
                });
            })
            ->orderByDesc('id')
            ->get();

        return response()->json($benefits);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
    $query = Beneficiary::with(['program', 'resident']);
        if ($request->has('beneficiary_type')) {
            $query->where('beneficiary_type', $request->beneficiary_type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('assistance_type')) {
            $query->where('assistance_type', $request->assistance_type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('contact_number', 'like', "%$search%")
                  ->orWhere('full_address', 'like', "%$search%")
                  ->orWhere('remarks', 'like', "%$search%")
                  ->orWhere('beneficiary_type', 'like', "%$search%")
                  ->orWhere('assistance_type', 'like', "%$search%")
                  ->orWhere('status', 'like', "%$search%")
                  ;
            });
        }
        return response()->json($query->orderByDesc('id')->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'name' => 'required|string',
            'beneficiary_type' => 'required|string',
            'status' => 'string',
            'assistance_type' => 'required|string',
            'amount' => 'nullable|numeric',
            'contact_number' => 'nullable|string',
            'email' => 'nullable|email',
            'full_address' => 'nullable|string',
            'application_date' => 'nullable|date',
            'approved_date' => 'nullable|date',
            'remarks' => 'nullable|string',
            'attachment' => 'nullable|file',
        ]);

        // Enforce max_beneficiaries limit
        if (!empty($data['program_id'])) {
            $program = \App\Models\Program::find($data['program_id']);
            if ($program && $program->max_beneficiaries) {
                $currentCount = \App\Models\Beneficiary::where('program_id', $program->id)->count();
                if ($currentCount >= $program->max_beneficiaries) {
                    return response()->json(['message' => 'Maximum number of beneficiaries reached for this program.'], 422);
                }
            }
        }
        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('attachments');
        }
        $beneficiary = Beneficiary::create($data);
        $beneficiary->load('program');
        return response()->json($beneficiary, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $beneficiary = Beneficiary::with(['disbursements', 'program'])->findOrFail($id);
        return response()->json($beneficiary);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Beneficiary $beneficiary)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $beneficiary = Beneficiary::findOrFail($id);
        $data = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'name' => 'sometimes|required|string',
            'beneficiary_type' => 'sometimes|required|string',
            'status' => 'string',
            'assistance_type' => 'sometimes|required|string',
            'amount' => 'nullable|numeric',
            'contact_number' => 'nullable|string',
            'email' => 'nullable|email',
            'full_address' => 'nullable|string',
            'application_date' => 'nullable|date',
            'approved_date' => 'nullable|date',
            'remarks' => 'nullable|string',
            'attachment' => 'nullable|file',
            'my_benefits_enabled' => 'boolean',
        ]);
        if ($request->hasFile('attachment')) {
            if ($beneficiary->attachment) {
                Storage::delete($beneficiary->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('attachments');
        }
        $beneficiary->update($data);
        $beneficiary->load('program');
        return response()->json($beneficiary);
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Toggle My Benefits status for a beneficiary
     */
    public function toggleMyBenefits(Request $request, $id)
    {
        \Log::info('toggleMyBenefits called', [
            'beneficiary_id' => $id,
            'request_data' => $request->all(),
            'user_id' => $request->user()->id ?? 'none'
        ]);

        $beneficiary = Beneficiary::findOrFail($id);
        
        \Log::info('Found beneficiary', [
            'beneficiary_id' => $beneficiary->id,
            'beneficiary_name' => $beneficiary->name,
            'current_my_benefits_enabled' => $beneficiary->my_benefits_enabled,
            'status' => $beneficiary->status
        ]);
        
        // Validate the request
        $data = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        \Log::info('Request validated', ['enabled' => $data['enabled']]);

        // Only allow enabling if the beneficiary is approved
        if ($data['enabled'] && $beneficiary->status !== 'Approved') {
            \Log::warning('Cannot enable benefits - beneficiary not approved', [
                'beneficiary_id' => $beneficiary->id,
                'status' => $beneficiary->status
            ]);
            return response()->json([
                'message' => 'Only approved beneficiaries can be enabled for My Benefits',
                'enabled' => false
            ], 422);
        }

        // Update the beneficiary
        $beneficiary->my_benefits_enabled = $data['enabled'];
        $beneficiary->save();

        \Log::info('Beneficiary updated', [
            'beneficiary_id' => $beneficiary->id,
            'new_my_benefits_enabled' => $beneficiary->my_benefits_enabled
        ]);

        // Find the resident by matching the beneficiary name with resident name
        \Log::info('Searching for resident by beneficiary name', [
            'beneficiary_name' => $beneficiary->name
        ]);

        $resident = \App\Models\Resident::whereHas('profile', function($query) use ($beneficiary) {
            // Try to match by name parts
            $nameParts = explode(' ', trim($beneficiary->name));
            if (count($nameParts) >= 2) {
                $firstName = $nameParts[0];
                $lastName = end($nameParts);
                \Log::info('Searching with name parts', [
                    'first_name' => $firstName,
                    'last_name' => $lastName
                ]);
                $query->where('first_name', 'LIKE', '%' . $firstName . '%')
                      ->where('last_name', 'LIKE', '%' . $lastName . '%');
            }
        })->with('profile')->first();

        \Log::info('Resident search result', [
            'resident_found' => !!$resident,
            'resident_id' => $resident->id ?? 'none',
            'resident_name' => $resident ? $resident->first_name . ' ' . $resident->last_name : 'none',
            'has_profile' => $resident && $resident->profile ? 'yes' : 'no'
        ]);

        if ($resident && $resident->profile) {
            // Update the resident's profile to enable/disable My Benefits
            $profile = $resident->profile;
            
            \Log::info('Current profile state', [
                'profile_id' => $profile->id,
                'current_my_benefits_enabled' => $profile->my_benefits_enabled,
                'current_permissions' => $profile->permissions
            ]);
            
            // Normalize permissions
            $permissions = $profile->permissions ?? [];
            if (is_string($permissions)) {
                $decoded = json_decode($permissions, true);
                $permissions = is_array($decoded) ? $decoded : [];
            }
            if (!is_array($permissions)) {
                $permissions = (array) $permissions;
            }

            // Set the my_benefits flag in permissions
            $permissions['my_benefits'] = (bool) $data['enabled'];
            
            \Log::info('Updating profile with new values', [
                'new_permissions' => $permissions,
                'new_my_benefits_enabled' => (bool) $data['enabled']
            ]);
            
            // Update both the permissions and the explicit boolean field
            $profile->permissions = $permissions;
            $profile->my_benefits_enabled = (bool) $data['enabled'];
            $profile->save();

            \Log::info('Updated resident profile for My Benefits', [
                'resident_id' => $resident->id,
                'beneficiary_id' => $beneficiary->id,
                'enabled' => $data['enabled'],
                'profile_updated' => true,
                'final_my_benefits_enabled' => $profile->my_benefits_enabled,
                'final_permissions' => $profile->permissions
            ]);
        } else {
            \Log::warning('Could not find resident profile for beneficiary', [
                'beneficiary_id' => $beneficiary->id,
                'beneficiary_name' => $beneficiary->name,
                'search_attempted' => true
            ]);
        }

        // Return the updated status
        return response()->json([
            'message' => 'My Benefits status updated successfully',
            'enabled' => $beneficiary->my_benefits_enabled
        ]);
    }

    public function destroy($id)
    {
        $beneficiary = Beneficiary::findOrFail($id);
        if ($beneficiary->attachment) {
            Storage::delete($beneficiary->attachment);
        }
        $beneficiary->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
