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
        Schema::create('application_form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('program_application_forms')->onDelete('cascade');
            $table->string('field_name');
            $table->string('field_label');
            $table->string('field_type'); // text, textarea, select, checkbox, file, email, number, date
            $table->text('field_description')->nullable();
            $table->boolean('is_required')->default(false);
            $table->json('field_options')->nullable(); // For select, checkbox options
            $table->json('validation_rules')->nullable(); // Custom validation rules
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_form_fields');
    }
};
