<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create default admin user
        User::firstOrCreate(
            ['email' => 'admin@barangay.com'],
            [
                'name' => 'Barangay Admin',
                'email' => 'admin@barangay.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'has_logged_in' => false,
            ]
        );

        // Create default staff user
        User::firstOrCreate(
            ['email' => 'staff@barangay.com'],
            [
                'name' => 'Barangay Staff',
                'email' => 'staff@barangay.com',
                'password' => Hash::make('staff123'),
                'role' => 'staff',
                'has_logged_in' => false,
            ]
        );

        // Seed programs and beneficiaries
        $this->call(ProgramAndBeneficiarySeeder::class);

    // Ensure the requested admin user exists
    $this->call(\Database\Seeders\AdminUserSeeder::class);

        // Create default treasurer user
        User::firstOrCreate(
            ['email' => 'treasurer@barangay.com'],
            [
                'name' => 'Barangay Treasurer',
                'email' => 'treasurer@barangay.com',
                'password' => Hash::make('treasurer123'),
                'role' => 'treasurer',
                'has_logged_in' => false,
            ]
        );

        // Mark admin email as verified
        $user = User::where('email', 'admin@barangay.com')->first();
        if ($user) {
            $user->email_verified_at = now();
            $user->save();
        }

        // Trigger email verification for a specific user
        $user = User::where('email', 'put_the_email_here')->first();
        if ($user) {
            $user->sendEmailVerificationNotification();
        }

        // Call other seeders
        // $this->call([
        //     CertificationSeeder::class,
        // ]);

        // \App\Models\User::factory(10)->create();
    }
}