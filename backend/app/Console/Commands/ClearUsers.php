<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ClearUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:clear {--confirm}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all users from the database (for testing)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userCount = User::count();
        
        if ($userCount === 0) {
            $this->info('No users to clear.');
            return 0;
        }
        
        if (!$this->option('confirm')) {
            if (!$this->confirm("This will delete all {$userCount} users. Are you sure?")) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }
        
        // Delete related records first to avoid foreign key constraint issues
        \DB::table('profiles')->delete();
        \DB::table('personal_access_tokens')->delete();
        \DB::table('password_resets')->delete();
        \DB::table('failed_jobs')->delete();
        
        // Then delete users
        User::query()->delete();
        
        $this->info("Successfully cleared {$userCount} users from the database.");
        
        return 0;
    }
}
