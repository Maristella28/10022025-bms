<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DocumentRequest;
use App\Models\User;
use App\Models\Resident;

class CertificationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get a sample user and resident for testing
        $user = User::where('role', 'resident')->first();
        
        if (!$user) {
            $this->command->info('No resident user found. Please create a resident user first.');
            return;
        }

        $resident = Resident::where('user_id', $user->id)->first();
        
        if (!$resident) {
            $this->command->info('No resident profile found for the user. Please create a resident profile first.');
            return;
        }

        // Sample certification requests
        $certifications = [
            [
                'document_type' => 'Brgy Certification',
                'certification_type' => 'Solo Parent Certification',
                'fields' => [
                    'fullName' => $resident->first_name . ' ' . $resident->last_name,
                    'address' => $resident->current_address,
                    'dateOfBirth' => $resident->birth_date,
                    'civilStatus' => $resident->civil_status,
                    'age' => $resident->age,
                    'purpose' => 'Solo Parent Certification',
                    'childName' => 'John Doe Jr.',
                    'childBirthDate' => '2015-05-15',
                ],
                'certification_data' => [
                    'child_name' => 'John Doe Jr.',
                    'child_birth_date' => '2015-05-15',
                ],
                'status' => 'approved',
                'priority' => 'normal',
            ],
            [
                'document_type' => 'Brgy Certification',
                'certification_type' => 'Delayed Registration of Birth Certificate',
                'fields' => [
                    'fullName' => $resident->first_name . ' ' . $resident->last_name,
                    'address' => $resident->current_address,
                    'dateOfBirth' => $resident->birth_date,
                    'civilStatus' => $resident->civil_status,
                    'age' => $resident->age,
                    'purpose' => 'Delayed Registration of Birth Certificate',
                    'registrationOffice' => 'Local Civil Registry Office - Barangay 727',
                    'registrationDate' => '2024-01-15',
                ],
                'certification_data' => [
                    'registration_office' => 'Local Civil Registry Office - Barangay 727',
                    'registration_date' => '2024-01-15',
                ],
                'status' => 'pending',
                'priority' => 'high',
            ],
            [
                'document_type' => 'Brgy Certification',
                'certification_type' => 'First Time Job Seeker',
                'fields' => [
                    'fullName' => $resident->first_name . ' ' . $resident->last_name,
                    'address' => $resident->current_address,
                    'dateOfBirth' => $resident->birth_date,
                    'civilStatus' => $resident->civil_status,
                    'age' => $resident->age,
                    'purpose' => 'First Time Job Seeker',
                ],
                'status' => 'approved',
                'priority' => 'normal',
            ],
            [
                'document_type' => 'Brgy Certification',
                'certification_type' => 'Good Moral Character',
                'fields' => [
                    'fullName' => $resident->first_name . ' ' . $resident->last_name,
                    'address' => $resident->current_address,
                    'dateOfBirth' => $resident->birth_date,
                    'civilStatus' => $resident->civil_status,
                    'age' => $resident->age,
                    'purpose' => 'Good Moral Character',
                    'remarks' => 'For employment purposes',
                ],
                'status' => 'processing',
                'priority' => 'normal',
            ],
        ];

        foreach ($certifications as $certification) {
            DocumentRequest::create([
                'user_id' => $user->id,
                'document_type' => $certification['document_type'],
                'certification_type' => $certification['certification_type'],
                'fields' => $certification['fields'],
                'certification_data' => $certification['certification_data'] ?? null,
                'status' => $certification['status'],
                'priority' => $certification['priority'],
                'estimated_completion' => now()->addDays(rand(3, 7)),
            ]);
        }

        $this->command->info('Sample certification requests created successfully!');
    }
}