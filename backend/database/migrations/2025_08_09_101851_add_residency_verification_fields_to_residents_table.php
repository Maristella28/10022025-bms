<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddResidencyVerificationFieldsToResidentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->string('verification_status')->nullable()->after('year_vaccinated');
            $table->text('denial_reason')->nullable()->after('verification_status');
            $table->string('residency_verification_image')->nullable()->after('denial_reason');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropColumn(['verification_status', 'denial_reason', 'residency_verification_image']);
        });
    }
}