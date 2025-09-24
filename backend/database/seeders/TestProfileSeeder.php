<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;

class TestProfileSeeder extends Seeder
{
    /**
     * Seed test data for profiles table to test RequestDocuments.jsx connection
     */
    public function run(): void
    {
        // Create a test user if it doesn't exist
        $user = User::firstOrCreate(
            ['email' => 'testuser@barangay.local'],
            [
                'name' => 'Test User',
                'email' => 'testuser@barangay.local',
                'password' => Hash::make('password123'),
                'role' => 'resident',
                'email_verified_at' => now(),
                'has_logged_in' => true,
            ]
        );

        // Create or update profile in profiles table
        $profile = Profile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'resident_id' => 'RES-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                'first_name' => 'Juan',
                'middle_name' => 'Cruz',
                'last_name' => 'Dela Rosa',
                'name_suffix' => null,
                'birth_date' => '1990-05-15',
                'birth_place' => 'Manila, Philippines',
                'age' => 34,
                'nationality' => 'Filipino',
                'sex' => 'Male',
                'civil_status' => 'Married',
                'religion' => 'Catholic',
                'relation_to_head' => 'Head',
                'email' => 'testuser@barangay.local',
                'mobile_number' => '+639123456789',
                'current_address' => '123 Sampaguita Street, Barangay San Jose, Quezon City',
                'current_photo' => 'profile_photos/test_user.jpg',
                'years_in_barangay' => 10,
                'voter_status' => 'Registered',
                'voters_id_number' => 'V123456789',
                'voting_location' => 'Barangay Hall',
                'housing_type' => 'Owned',
                'head_of_family' => true,
                'household_no' => 'HH-001',
                'classified_sector' => 'Private Employee',
                'educational_attainment' => 'College Graduate',
                'occupation_type' => 'Office Worker',
                'salary_income' => '25000-35000',
                'business_info' => null,
                'business_type' => null,
                'business_location' => null,
                'business_outside_barangay' => false,
                'special_categories' => ['Working Age Adult'],
                'covid_vaccine_status' => 'Fully Vaccinated',
                'vaccine_received' => ['Pfizer', 'Booster'],
                'other_vaccine' => null,
                'year_vaccinated' => '2021',
                'residency_verification_image' => 'verification/test_user_verification.jpg',
                'verification_status' => 'approved',
                'denial_reason' => null,
                'profile_completed' => true,
                'permissions' => [
                    'my_benefits' => false,
                    'document_requests' => true,
                    'asset_requests' => true,
                ],
                'my_benefits_enabled' => false,
            ]
        );

        $this->command->info("✅ Test profile created for RequestDocuments.jsx testing:");
        $this->command->info("   - User ID: {$user->id}");
        $this->command->info("   - Profile ID: {$profile->id}");
        $this->command->info("   - Full Name: {$profile->first_name} {$profile->middle_name} {$profile->last_name}");
        $this->command->info("   - Email: {$profile->email}");
        $this->command->info("   - Address: {$profile->current_address}");
        $this->command->info("   - Test login: testuser@barangay.local / password123");
    }
}
