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
            $table->decimal('payment_amount', 10, 2)->nullable()->after('status');
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid')->after('payment_amount');
            $table->text('payment_notes')->nullable()->after('payment_status');
            $table->timestamp('payment_approved_at')->nullable()->after('payment_notes');
            $table->timestamp('payment_confirmed_at')->nullable()->after('payment_approved_at');
            $table->unsignedBigInteger('payment_approved_by')->nullable()->after('payment_confirmed_at');
            $table->unsignedBigInteger('payment_confirmed_by')->nullable()->after('payment_approved_by');
            
            $table->foreign('payment_approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('payment_confirmed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropForeign(['payment_approved_by']);
            $table->dropForeign(['payment_confirmed_by']);
            $table->dropColumn([
                'payment_amount',
                'payment_status',
                'payment_notes',
                'payment_approved_at',
                'payment_confirmed_at',
                'payment_approved_by',
                'payment_confirmed_by'
            ]);
        });
    }
};
