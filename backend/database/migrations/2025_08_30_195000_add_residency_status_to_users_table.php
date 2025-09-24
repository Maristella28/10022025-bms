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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('residency_status', ['active', 'inactive', 'deceased', 'relocated', 'for_review'])
                ->default('active')
                ->after('privacy_policy_accepted_at');
            $table->timestamp('last_activity_at')->nullable()->after('residency_status');
            $table->timestamp('status_updated_at')->nullable()->after('last_activity_at');
            $table->text('status_notes')->nullable()->after('status_updated_at');
            $table->unsignedBigInteger('status_updated_by')->nullable()->after('status_notes');

            $table->index(['residency_status', 'last_activity_at']);
            $table->foreign('status_updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['status_updated_by']);
            $table->dropColumn([
                'residency_status',
                'last_activity_at',
                'status_updated_at',
                'status_notes',
                'status_updated_by'
            ]);
        });
    }
};
