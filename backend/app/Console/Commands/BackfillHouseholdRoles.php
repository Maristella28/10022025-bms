<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Resident;

class BackfillHouseholdRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backfill:household-roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill household_role on residents table based on households table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting household role backfill...');

        // Reset all roles to null first to avoid stale data
        Resident::query()->update(['household_role' => null]);

        // Mark heads from households.head_resident_id
        $heads = DB::table('households')->whereNotNull('head_resident_id')->pluck('head_resident_id')->unique();
        $this->info('Found '.count($heads).' head_resident_id entries.');
        if ($heads->count()) {
            Resident::whereIn('id', $heads->toArray())->update(['household_role' => 'head']);
        }

        // Mark members: residents that have a household_no but are not marked head
        $members = Resident::whereNotNull('household_no')->whereNull('household_role')->pluck('id');
        $this->info('Marking '.count($members).' residents as members.');
        if ($members->count()) {
            Resident::whereIn('id', $members->toArray())->update(['household_role' => 'member']);
        }

        $this->info('Backfill complete.');
        return 0;
    }
}
