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
        Schema::create('application_submission_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('application_submissions')->onDelete('cascade');
            $table->foreignId('field_id')->constrained('application_form_fields')->onDelete('cascade');
            $table->text('field_value')->nullable(); // Store text values
            $table->string('file_path')->nullable(); // Store file paths for file uploads
            $table->string('file_original_name')->nullable(); // Original filename
            $table->string('file_mime_type')->nullable(); // File MIME type
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_submission_data');
    }
};
