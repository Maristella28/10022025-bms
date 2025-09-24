<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            // Add unique constraint to prevent duplicate residents for the same user
            $table->unique('user_id', 'residents_user_id_unique');
        });
        
        Schema::table('profiles', function (Blueprint $table) {
            // Add unique constraint to prevent duplicate profiles for the same user
            $table->unique('user_id', 'profiles_user_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropUnique('residents_user_id_unique');
        });
        
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropUnique('profiles_user_id_unique');
        });
    }
};