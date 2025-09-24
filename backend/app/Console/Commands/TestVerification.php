<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class TestVerification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:verification {email} {code}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test verification process for a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $code = $this->argument('code');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }
        
        $this->info("User found: {$user->name} (ID: {$user->id})");
        $this->info("Email verified: " . ($user->email_verified_at ? 'Yes' : 'No'));
        $this->info("Verification code: " . ($user->verification_code ?: 'NULL'));
        $this->info("Code expires at: " . ($user->verification_code_expires_at ?: 'NULL'));
        $this->info("Is code expired: " . ($user->isVerificationCodeExpired() ? 'Yes' : 'No'));
        $this->info("Code matches: " . ($user->verification_code === $code ? 'Yes' : 'No'));
        
        if ($user->verification_code === $code && !$user->isVerificationCodeExpired()) {
            $this->info("✅ Code is valid! Updating user...");
            
            $user->update([
                'email_verified_at' => now(),
                'verification_code' => null,
                'verification_code_expires_at' => null,
            ]);
            
            $this->info("✅ User verified successfully!");
        } else {
            $this->error("❌ Code is invalid or expired!");
        }
        
        return 0;
    }
} 