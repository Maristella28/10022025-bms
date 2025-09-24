<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('profiles', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('barangay_members', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('blotter_records', function (Blueprint $table) {
            $table->softDeletes();
        });
        Schema::table('document_requests', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('barangay_members', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('blotter_records', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
