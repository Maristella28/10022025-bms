<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Drop foreign key constraints referencing residents
    // No resident_id foreign key in profiles, nothing to drop here
        if (Schema::hasTable('residents')) {
                Schema::table('asset_requests', function (Blueprint $table) {
                    if (Schema::hasColumn('asset_requests', 'resident_id')) {
                        $table->dropForeign(['resident_id']);
                    }
                });
                Schema::table('blotter_requests', function (Blueprint $table) {
                    if (Schema::hasColumn('blotter_requests', 'resident_id')) {
                        $table->dropForeign(['resident_id']);
                    }
                });
                Schema::table('blotter_records', function (Blueprint $table) {
                    if (Schema::hasColumn('blotter_records', 'resident_id')) {
                        $table->dropForeign(['resident_id']);
                    }
                });
                // Drop foreign key in residents table itself
                Schema::table('residents', function (Blueprint $table) {
                    if (Schema::hasColumn('residents', 'profile_id')) {
                        $table->dropForeign(['profile_id']);
                    }
                });
        }
        Schema::dropIfExists('residents');
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade')->unique();
            $table->unsignedBigInteger('profile_id')->nullable();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->string('resident_id')->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_suffix')->nullable();
            $table->date('birth_date');
            $table->string('birth_place');
            $table->unsignedTinyInteger('age');
            $table->string('nationality')->nullable();
            $table->string('sex');
            $table->string('civil_status');
            $table->string('religion');
            $table->string('relation_to_head')->nullable();
            $table->string('email');
            $table->string('mobile_number')->nullable();
            $table->text('current_address')->nullable();
            $table->string('current_photo')->nullable();
            $table->unsignedTinyInteger('years_in_barangay')->nullable();
            $table->string('voter_status')->nullable();
            $table->string('voters_id_number')->nullable();
            $table->string('voting_location')->nullable();
            $table->string('housing_type')->nullable();
            $table->boolean('head_of_family')->nullable();
            $table->string('household_no')->nullable();
            $table->string('classified_sector')->nullable();
            $table->string('educational_attainment')->nullable();
            $table->string('occupation_type')->nullable();
            $table->string('salary_income')->nullable();
            $table->string('business_info')->nullable();
            $table->string('business_type')->nullable();
            $table->string('business_location')->nullable();
            $table->boolean('business_outside_barangay')->nullable();
            $table->json('special_categories')->nullable();
            $table->string('covid_vaccine_status')->nullable();
            $table->json('vaccine_received')->nullable();
            $table->string('other_vaccine')->nullable();
            $table->string('year_vaccinated')->nullable();
            $table->string('residency_verification_image')->nullable();
            $table->string('verification_status')->nullable();
            $table->string('denial_reason')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
