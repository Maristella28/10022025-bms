<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, let's clean up orphaned residents that don't have corresponding profiles
        echo "Cleaning up orphaned residents...\n";
        
        // Find residents without profiles and delete them
        $orphanedResidents = DB::table('residents')
            ->whereNull('profile_id')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('profiles')
                    ->whereColumn('profiles.user_id', 'residents.user_id');
            })
            ->get();

        echo "Found " . $orphanedResidents->count() . " orphaned residents to clean up\n";
        
        foreach ($orphanedResidents as $resident) {
            // Delete any related records first (only if columns exist)
            if (Schema::hasColumn('asset_requests', 'resident_id')) {
                DB::table('asset_requests')->where('resident_id', $resident->id)->delete();
            }
            if (Schema::hasColumn('blotter_requests', 'resident_id')) {
                DB::table('blotter_requests')->where('resident_id', $resident->id)->delete();
            }
            if (Schema::hasColumn('blotter_records', 'resident_id')) {
                DB::table('blotter_records')->where('resident_id', $resident->id)->delete();
            }
            
            // Delete the orphaned resident
            DB::table('residents')->where('id', $resident->id)->delete();
        }

        // Now sync remaining residents with profiles
        echo "Syncing residents with profiles...\n";
        
        $profiles = DB::table('profiles')->get();
        
        foreach ($profiles as $profile) {
            // Find or create resident for this profile
            $resident = DB::table('residents')
                ->where('user_id', $profile->user_id)
                ->first();
            
            if (!$resident) {
                // Create resident from profile data
                $residentData = [
                    'user_id' => $profile->user_id,
                    'profile_id' => $profile->id,
                    'resident_id' => $profile->resident_id,
                    'first_name' => $profile->first_name ?? '',
                    'middle_name' => $profile->middle_name ?? '',
                    'last_name' => $profile->last_name ?? '',
                    'name_suffix' => $profile->name_suffix ?? '',
                    'birth_date' => $profile->birth_date ?? '1900-01-01',
                    'birth_place' => $profile->birth_place ?? 'Unknown',
                    'age' => $profile->age ?? 0,
                    'nationality' => $profile->nationality ?? 'Filipino',
                    'sex' => $profile->sex ?? 'Unknown',
                    'civil_status' => $profile->civil_status ?? 'Single',
                    'religion' => $profile->religion ?? 'Unknown',
                    'relation_to_head' => $profile->relation_to_head ?? 'Self',
                    'email' => $profile->email ?? '',
                    'mobile_number' => $profile->mobile_number ?? '',
                    'current_address' => $profile->current_address ?? '',
                    'current_photo' => $profile->current_photo ?? null,
                    'years_in_barangay' => $profile->years_in_barangay ?? 0,
                    'voter_status' => $profile->voter_status ?? 'Not Registered',
                    'voters_id_number' => $profile->voters_id_number ?? '',
                    'voting_location' => $profile->voting_location ?? '',
                    'housing_type' => $profile->housing_type ?? 'Unknown',
                    'head_of_family' => $profile->head_of_family ?? 0,
                    'household_no' => $profile->household_no ?? '',
                    'classified_sector' => $profile->classified_sector ?? 'Unknown',
                    'educational_attainment' => $profile->educational_attainment ?? 'Unknown',
                    'occupation_type' => $profile->occupation_type ?? 'Unknown',
                    'salary_income' => $profile->salary_income ?? 0,
                    'business_info' => $profile->business_info ?? '',
                    'business_type' => $profile->business_type ?? '',
                    'business_location' => $profile->business_location ?? '',
                    'business_outside_barangay' => $profile->business_outside_barangay ?? 0,
                    'special_categories' => is_string($profile->special_categories) ? $profile->special_categories : json_encode($profile->special_categories ?? []),
                    'covid_vaccine_status' => $profile->covid_vaccine_status ?? 'Unknown',
                    'vaccine_received' => is_string($profile->vaccine_received) ? $profile->vaccine_received : json_encode($profile->vaccine_received ?? []),
                    'other_vaccine' => $profile->other_vaccine ?? '',
                    'year_vaccinated' => $profile->year_vaccinated ?? null,
                    'residency_verification_image' => $profile->residency_verification_image ?? null,
                    'verification_status' => $profile->verification_status ?? 'pending',
                    'denial_reason' => $profile->denial_reason ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                $residentId = DB::table('residents')->insertGetId($residentData);
                echo "Created resident ID: $residentId for profile ID: {$profile->id}\n";
            } else {
                // Update existing resident with profile data and link them
                $residentData = [
                    'profile_id' => $profile->id,
                    'resident_id' => $profile->resident_id,
                    'first_name' => $profile->first_name ?? '',
                    'middle_name' => $profile->middle_name ?? '',
                    'last_name' => $profile->last_name ?? '',
                    'name_suffix' => $profile->name_suffix ?? '',
                    'birth_date' => $profile->birth_date ?? '1900-01-01',
                    'birth_place' => $profile->birth_place ?? 'Unknown',
                    'age' => $profile->age ?? 0,
                    'nationality' => $profile->nationality ?? 'Filipino',
                    'sex' => $profile->sex ?? 'Unknown',
                    'civil_status' => $profile->civil_status ?? 'Single',
                    'religion' => $profile->religion ?? 'Unknown',
                    'relation_to_head' => $profile->relation_to_head ?? 'Self',
                    'email' => $profile->email ?? '',
                    'mobile_number' => $profile->mobile_number ?? '',
                    'current_address' => $profile->current_address ?? '',
                    'current_photo' => $profile->current_photo ?? null,
                    'years_in_barangay' => $profile->years_in_barangay ?? 0,
                    'voter_status' => $profile->voter_status ?? 'Not Registered',
                    'voters_id_number' => $profile->voters_id_number ?? '',
                    'voting_location' => $profile->voting_location ?? '',
                    'housing_type' => $profile->housing_type ?? 'Unknown',
                    'head_of_family' => $profile->head_of_family ?? 0,
                    'household_no' => $profile->household_no ?? '',
                    'classified_sector' => $profile->classified_sector ?? 'Unknown',
                    'educational_attainment' => $profile->educational_attainment ?? 'Unknown',
                    'occupation_type' => $profile->occupation_type ?? 'Unknown',
                    'salary_income' => $profile->salary_income ?? 0,
                    'business_info' => $profile->business_info ?? '',
                    'business_type' => $profile->business_type ?? '',
                    'business_location' => $profile->business_location ?? '',
                    'business_outside_barangay' => $profile->business_outside_barangay ?? 0,
                    'special_categories' => is_string($profile->special_categories) ? $profile->special_categories : json_encode($profile->special_categories ?? []),
                    'covid_vaccine_status' => $profile->covid_vaccine_status ?? 'Unknown',
                    'vaccine_received' => is_string($profile->vaccine_received) ? $profile->vaccine_received : json_encode($profile->vaccine_received ?? []),
                    'other_vaccine' => $profile->other_vaccine ?? '',
                    'year_vaccinated' => $profile->year_vaccinated ?? null,
                    'residency_verification_image' => $profile->residency_verification_image ?? null,
                    'verification_status' => $profile->verification_status ?? 'pending',
                    'denial_reason' => $profile->denial_reason ?? null,
                    'updated_at' => now(),
                ];
                
                DB::table('residents')
                    ->where('id', $resident->id)
                    ->update($residentData);
                
                echo "Updated resident ID: {$resident->id} for profile ID: {$profile->id}\n";
            }
        }

        // Clean up any remaining orphaned residents
        $remainingOrphans = DB::table('residents')
            ->whereNull('profile_id')
            ->count();
            
        if ($remainingOrphans > 0) {
            echo "Cleaning up $remainingOrphans remaining orphaned residents...\n";
            DB::table('residents')->whereNull('profile_id')->delete();
        }

        echo "Profile-Resident sync completed!\n";
    }

    public function down(): void
    {
        // This migration is not reversible as it cleans up data
        echo "This migration cannot be reversed as it cleans up orphaned data.\n";
    }
};