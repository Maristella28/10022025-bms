<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class FixAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:admin-user {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix admin user by setting email_verified_at';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }
        
        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ]);
        
        \Log::info('User after update:', $user->toArray());
        
        $this->info("Admin user {$email} has been fixed and can now login.");
        return 0;
    }
} 