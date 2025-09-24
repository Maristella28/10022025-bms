<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProgramAndBeneficiarySeeder extends Seeder
{
    public function run(): void
    {
        // Insert sample programs
        $programs = [
            [
                'name' => '4Ps',
                'description' => 'Pantawid Pamilyang Pilipino Program',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Senior Citizen Pension',
                'description' => 'Monthly pension for senior citizens',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('programs')->insert($programs);

        // Get inserted program IDs
        $programIds = DB::table('programs')->pluck('id')->toArray();

        // Insert sample beneficiaries
        $beneficiaries = [
            [
                'name' => 'Maria Santos',
                'beneficiary_type' => 'Senior Citizen',
                'status' => 'Approved',
                'application_date' => '2024-01-15',
                'approved_date' => '2024-01-20',
                'contact_number' => '+63 912 345 6789',
                'email' => 'maria.santos@email.com',
                'address' => '123 Barangay Street, City',
                'assistance_type' => 'Monthly Pension',
                'amount' => 5000,
                'remarks' => 'All requirements submitted and verified',
                'program_id' => $programIds[1] ?? 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Juan Dela Cruz',
                'beneficiary_type' => '4Ps',
                'status' => 'Pending',
                'application_date' => '2024-02-10',
                'approved_date' => null,
                'contact_number' => '+63 933 222 1111',
                'email' => 'juan.delacruz@email.com',
                'address' => '456 Barangay Avenue, City',
                'assistance_type' => 'Cash Grant',
                'amount' => 2000,
                'remarks' => 'Waiting for document verification',
                'program_id' => $programIds[0] ?? 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('beneficiaries')->insert($beneficiaries);
    }
}
