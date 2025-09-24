<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all users in the database';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $users = User::all(['id', 'name', 'email', 'created_at']);
        
        if ($users->count() > 0) {
            $this->info('Found ' . $users->count() . ' users in database:');
            $this->table(
                ['ID', 'Name', 'Email', 'Created At'],
                $users->map(function($user) {
                    return [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->created_at
                    ];
                })->toArray()
            );
        } else {
            $this->info('No users found in database.');
        }
        
        return 0;
    }
}
