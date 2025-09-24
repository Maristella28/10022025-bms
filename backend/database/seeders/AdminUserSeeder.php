<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create or update the requested admin user
        $user = User::updateOrCreate(
            ['email' => 'brgymamatid.egovsystem@gmail.com'],
            [
                'name' => 'Barangay Mamatid Admin',
                'password' => Hash::make('Egovbrgymamatid2025'),
                'role' => 'admin',
                'has_logged_in' => false,
                'email_verified_at' => now(),
            ]
        );

        if ($this->command) {
            $this->command->info('Admin user ensured: ' . $user->email);
        }
    }
}
