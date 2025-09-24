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
            // Add certification type field for Brgy Certification documents
            $table->string('certification_type')->nullable()->after('document_type');
            
            // Add additional fields for specific certifications
            $table->json('certification_data')->nullable()->after('fields');
            
            // Add processing notes for admin use
            $table->text('processing_notes')->nullable()->after('status');
            
            // Add priority level for urgent requests
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('processing_notes');
            
            // Add estimated completion date
            $table->date('estimated_completion')->nullable()->after('priority');
            
            // Add actual completion date
            $table->timestamp('completed_at')->nullable()->after('estimated_completion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropColumn([
                'certification_type',
                'certification_data',
                'processing_notes',
                'priority',
                'estimated_completion',
                'completed_at'
            ]);
        });
    }
};