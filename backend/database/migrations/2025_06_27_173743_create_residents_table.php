<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('residents', function (Blueprint $table) {
            $table->id();

            // Optional Foreign Key to users table (if applicable)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained()
                  ->onDelete('cascade')
                  ->unique();

            // Basic Identifiers
            $table->string('residents_id')->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_suffix')->nullable();

            // Personal Info
            $table->date('birth_date');
            $table->string('birth_place');
            $table->unsignedTinyInteger('age');
            $table->string('nationality')->nullable();
            $table->string('sex');
            $table->string('civil_status');
            $table->string('religion');
            $table->string('relation_to_head')->nullable();

            // Contact Info
            $table->string('email');
            $table->string('contact_number');

            // Address Info
            $table->text('full_address');
            $table->unsignedTinyInteger('years_in_barangay');

            // Voter Info
            $table->string('voter_status');
            $table->string('voters_id_number')->nullable();
            $table->string('voting_location')->nullable();

            // Profile Picture
            $table->string('avatar')->nullable();

            // Housing Info
            $table->string('housing_type')->nullable();
            $table->boolean('head_of_family')->nullable();
            $table->string('household_no')->nullable();

            // Education and Sector Info
            $table->string('classified_sector')->nullable();
            $table->string('educational_attainment')->nullable();
            $table->string('occupation_type')->nullable();
            $table->string('salary_income')->nullable();

            // Business Info
            $table->string('business_info')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_location')->nullable();
            $table->boolean('business_outside_barangay')->nullable();

            // Special Categories and COVID Info
            $table->json('special_categories')->nullable();
            $table->string('covid_vaccine_status')->nullable();
            $table->json('vaccine_received')->nullable();
            $table->string('other_vaccine')->nullable();
            $table->string('year_vaccinated')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
