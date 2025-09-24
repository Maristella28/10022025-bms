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
        Schema::table('profiles', function (Blueprint $table) {
            // Make required fields nullable for initial profile creation
            // These fields will be required when the actual profile is created/updated
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
            $table->date('birth_date')->nullable()->change();
            $table->string('birth_place')->nullable()->change();
            $table->integer('age')->nullable()->change();
            $table->string('sex')->nullable()->change();
            $table->string('civil_status')->nullable()->change();
            $table->string('religion')->nullable()->change();
            // Removed contact_number and full_address as they do not exist in profiles
            $table->integer('years_in_barangay')->nullable()->change();
            $table->string('voter_status')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Revert fields back to required
            $table->string('first_name')->nullable(false)->change();
            $table->string('last_name')->nullable(false)->change();
            $table->date('birth_date')->nullable(false)->change();
            $table->string('birth_place')->nullable(false)->change();
            $table->integer('age')->nullable(false)->change();
            $table->string('sex')->nullable(false)->change();
            $table->string('civil_status')->nullable(false)->change();
            $table->string('religion')->nullable(false)->change();
            // Removed contact_number and full_address as they do not exist in profiles
            $table->integer('years_in_barangay')->nullable(false)->change();
            $table->string('voter_status')->nullable(false)->change();
        });
    }
};
