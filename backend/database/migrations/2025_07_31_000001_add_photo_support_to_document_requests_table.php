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
        Schema::table('document_requests', function (Blueprint $table) {
            // Add photo path field for uploaded photos
            $table->string('photo_path')->nullable()->after('pdf_path');
            
            // Add photo type field to distinguish between different photo types
            $table->string('photo_type')->nullable()->after('photo_path')->comment('passport, id_photo, etc.');
            
            // Add photo metadata as JSON for storing additional info
            $table->json('photo_metadata')->nullable()->after('photo_type')->comment('file size, dimensions, etc.');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropColumn([
                'photo_path',
                'photo_type',
                'photo_metadata'
            ]);
        });
    }
};