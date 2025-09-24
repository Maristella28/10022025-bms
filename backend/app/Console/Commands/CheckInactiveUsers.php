<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Console\Command;

class CheckInactiveUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:check-inactive {--dry-run : Show what would be updated without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for users inactive for 1 year and flag them for review';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for inactive users...');

        // Find users who haven't been active for 1 year
        $inactiveUsers = User::where('last_activity_at', '<', now()->subYear())
            ->where('residency_status', '!=', 'for_review')
            ->where('residency_status', '!=', 'deceased')
            ->where('role', 'residents')
            ->get();

        if ($inactiveUsers->isEmpty()) {
            $this->info('No inactive users found.');
            return;
        }

        $this->info("Found {$inactiveUsers->count()} inactive users:");

        foreach ($inactiveUsers as $user) {
            $this->line("- {$user->name} ({$user->email}) - Last activity: {$user->last_activity_at?->format('Y-m-d')}");

            if (!$this->option('dry-run')) {
                $user->updateResidencyStatus(
                    'for_review',
                    'Automatically flagged for review due to 1 year of inactivity',
                    null // System update
                );

                // Log the activity
                ActivityLogService::log(
                    'residency_status_update',
                    $user,
                    ['residency_status' => $user->getOriginal('residency_status')],
                    ['residency_status' => 'for_review'],
                    "User {$user->name} flagged for review due to inactivity"
                );
            }
        }

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN: No changes were made. Remove --dry-run flag to apply changes.');
        } else {
            $this->info('Inactive users have been flagged for review.');
        }

        // Show summary
        $this->newLine();
        $this->info('Summary:');
        $this->info("- Total inactive users found: {$inactiveUsers->count()}");
        $this->info("- Users flagged for review: " . ($this->option('dry-run') ? 0 : $inactiveUsers->count()));
    }
}
