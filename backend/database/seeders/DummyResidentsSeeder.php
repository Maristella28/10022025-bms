<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Resident;
use Illuminate\Support\Facades\Hash;

class DummyResidentsSeeder extends Seeder
{
    public function run()
    {
        for ($i = 1; $i <= 10; $i++) {
            $email = sprintf('dummy%02d@example.com', $i);
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => sprintf('Dummy User %02d', $i),
                    'email' => $email,
                    'password' => Hash::make('password'),
                ]
            );

            $residentData = [
                'user_id' => $user->id,
                'resident_id' => sprintf('R%06d', $i),
                'first_name' => sprintf('First%02d', $i),
                'middle_name' => 'M',
                'last_name' => sprintf('Last%02d', $i),
                'name_suffix' => null,
                'birth_date' => now()->subYears(20 + $i)->toDateString(),
                'birth_place' => 'Test City',
                'age' => 20 + $i,
                'nationality' => 'Filipino',
                'sex' => ($i % 2 ? 'Male' : 'Female'),
                'civil_status' => 'Single',
                'religion' => 'None',
                'relation_to_head' => 'Self',
                'email' => $email,
                'mobile_number' => sprintf('0917%07d', 1000000 + $i),
                'current_address' => '123 Test St, Barangay',
                'years_in_barangay' => 5,
                'voter_status' => 'No',
                'voters_id_number' => null,
                'voting_location' => 'Barangay Hall',
                'current_photo' => null,
                'housing_type' => 'Owned',
                'head_of_family' => true,
                'household_no' => sprintf('HH-%04d', $i),
                'household_role' => 'head',
                'classified_sector' => 'General',
                'educational_attainment' => 'College',
                'occupation_type' => 'Employee',
                'salary_income' => (string)(15000 + ($i * 500)),
                'business_info' => null,
                'business_type' => null,
                'business_location' => null,
                'business_outside_barangay' => false,
                'special_categories' => null,
                'covid_vaccine_status' => 'Completed',
                'vaccine_received' => null,
                'other_vaccine' => null,
                'year_vaccinated' => (string)(now()->year - 1),
            ];

            $resident = Resident::updateOrCreate(['user_id' => $user->id], $residentData);

            // Ensure relationship
            $user->resident()->save($resident);
        }
    }
}
