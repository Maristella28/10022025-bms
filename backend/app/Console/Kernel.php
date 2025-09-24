<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
    // Daily check to mark residents for review based on activity.
    // Runs at 01:00 every day.
    $schedule->command('residents:check-review')->dailyAt('01:00')->withoutOverlapping();

    // Daily check for inactive users and flag them for review.
    // Runs at 02:00 every day.
    $schedule->command('users:check-inactive')->dailyAt('02:00')->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
