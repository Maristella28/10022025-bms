<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('disaster_emergency_records', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->date('date');
            $table->string('location');
            $table->text('description');
            $table->text('actions_taken')->nullable();
            $table->string('casualties')->nullable();
            $table->string('reported_by')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('disaster_emergency_records');
    }
}; 