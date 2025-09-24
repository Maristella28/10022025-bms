<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clean up duplicate residents - keep the first one for each user_id
        $duplicateResidents = DB::select("
            SELECT user_id, MIN(id) as keep_id, COUNT(*) as count 
            FROM residents 
            GROUP BY user_id 
            HAVING COUNT(*) > 1
        ");
        
        foreach ($duplicateResidents as $duplicate) {
            // Delete all residents for this user except the one we want to keep
            $residentsToDelete = DB::table('residents')
                ->where('user_id', $duplicate->user_id)
                ->where('id', '!=', $duplicate->keep_id)
                ->get();
            
            foreach ($residentsToDelete as $resident) {
                // Delete associated profile if it exists
                if ($resident->profile_id) {
                    DB::table('profiles')->where('id', $resident->profile_id)->delete();
                }
                // Delete the resident record
                DB::table('residents')->where('id', $resident->id)->delete();
            }
            
            echo "Cleaned up " . ($duplicate->count - 1) . " duplicate residents for user_id: " . $duplicate->user_id . "\n";
        }
        
        // Clean up duplicate profiles - keep the first one for each user_id
        $duplicateProfiles = DB::select("
            SELECT user_id, MIN(id) as keep_id, COUNT(*) as count 
            FROM profiles 
            GROUP BY user_id 
            HAVING COUNT(*) > 1
        ");
        
        foreach ($duplicateProfiles as $duplicate) {
            // Delete all profiles for this user except the one we want to keep
            DB::table('profiles')
                ->where('user_id', $duplicate->user_id)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();
            
            echo "Cleaned up " . ($duplicate->count - 1) . " duplicate profiles for user_id: " . $duplicate->user_id . "\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed as it deletes data
        // If you need to reverse, you would need to restore from backup
    }
};