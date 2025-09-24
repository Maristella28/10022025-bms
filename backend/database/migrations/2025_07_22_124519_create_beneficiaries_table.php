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
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->nullable()->constrained('programs')->nullOnDelete();
            $table->string('name');
            $table->string('beneficiary_type'); // e.g., student, senior, PWD, etc.
            $table->string('status')->default('Pending'); // Application status
            $table->string('assistance_type'); // e.g., pension, educational, etc.
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->date('application_date')->nullable();
            $table->date('approved_date')->nullable();
            $table->text('remarks')->nullable();
            $table->string('attachment')->nullable(); // File path
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
