<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid')->after('status');
            $table->string('receipt_number')->nullable()->after('payment_status');
            $table->decimal('amount_paid', 10, 2)->nullable()->after('receipt_number');
            $table->timestamp('paid_at')->nullable()->after('amount_paid');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'receipt_number', 'amount_paid', 'paid_at']);
        });
    }
};
