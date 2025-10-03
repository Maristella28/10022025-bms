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
        Schema::table('projects', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('status');
            $table->text('remarks')->nullable()->after('completed_at');
            $table->json('uploaded_files')->nullable()->after('remarks');
            $table->boolean('created_by_admin')->default(false)->after('published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['completed_at', 'remarks', 'uploaded_files', 'created_by_admin']);
        });
    }
};
