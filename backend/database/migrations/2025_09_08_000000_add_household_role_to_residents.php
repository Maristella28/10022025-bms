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
        Schema::table('residents', function (Blueprint $table) {
            // Add a simple enum-like column to indicate household role (head or member)
            // using enum keeps values constrained; make nullable for backward compatibility
            if (!Schema::hasColumn('residents', 'household_role')) {
                $table->enum('household_role', ['head', 'member'])->nullable()->default('member')->after('household_no');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('residents', function (Blueprint $table) {
            if (Schema::hasColumn('residents', 'household_role')) {
                $table->dropColumn('household_role');
            }
        });
    }
};
