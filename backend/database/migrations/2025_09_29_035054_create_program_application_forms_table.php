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
        Schema::create('program_application_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft, published, closed
            $table->timestamp('published_at')->nullable();
            $table->timestamp('deadline')->nullable();
            $table->boolean('allow_multiple_submissions')->default(false);
            $table->json('form_settings')->nullable(); // Additional form configuration
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_application_forms');
    }
};
