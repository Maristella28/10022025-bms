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
        Schema::create('resident_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resident_id');
            $table->unsignedBigInteger('program_id')->nullable();
            $table->string('type'); // 'payout_change', 'status_update', 'general'
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional data like new payout date
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->foreign('resident_id')->references('id')->on('residents')->onDelete('cascade');
            $table->foreign('program_id')->references('id')->on('programs')->onDelete('cascade');
            $table->index(['resident_id', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resident_notifications');
    }
};
