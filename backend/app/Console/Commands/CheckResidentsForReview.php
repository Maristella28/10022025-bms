<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Resident;

class CheckResidentsForReview extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'residents:check-review {--chunk=100}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Batch-check residents and flag/update the `for_review` column based on last activity.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting resident review check...');

        $chunk = (int) $this->option('chunk');
        $updated = 0;
        $processed = 0;

        Resident::with('user')->chunk($chunk, function ($residents) use (&$updated, &$processed) {
            foreach ($residents as $resident) {
                $processed++;
                $original = $resident->for_review;

                // Determine last activity
                $lastModified = $resident->last_modified;
                $lastLogin = optional($resident->user)->updated_at;
                $lastActivity = $lastModified ?: $lastLogin;

                $shouldReview = false;
                if (!$lastActivity) {
                    $shouldReview = true;
                } else {
                    $months = now()->diffInMonths($lastActivity);
                    $shouldReview = $months >= 12;
                }

                if ($resident->for_review !== $shouldReview) {
                    $resident->for_review = $shouldReview;
                    $resident->save();
                    $updated++;
                }
            }
        });

        $this->info("Processed {$processed} residents. Updated: {$updated} records.");

        return 0;
    }
}
