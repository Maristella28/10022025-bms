<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('blotter_records', function (Blueprint $table) {
            $table->id();
            $table->string('case_number')->unique();
            $table->unsignedBigInteger('resident_id');
            $table->string('complainant_name');
            $table->string('respondent_name');
            $table->string('complaint_type');
            $table->text('complaint_details');
            $table->date('incident_date');
            $table->time('incident_time');
            $table->string('incident_location');
            $table->string('witnesses')->nullable();
            $table->string('supporting_documents')->nullable();
            $table->string('preferred_action')->nullable();
            $table->string('contact_number');
            $table->string('email');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('blotter_records');
    }
}; 