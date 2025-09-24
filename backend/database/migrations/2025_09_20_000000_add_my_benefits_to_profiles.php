<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('profiles', 'permissions')) {
                $table->json('permissions')->nullable()->after('denial_reason');
            }
            if (!Schema::hasColumn('profiles', 'my_benefits_enabled')) {
                $table->boolean('my_benefits_enabled')->default(false)->after('permissions');
            }
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            if (Schema::hasColumn('profiles', 'my_benefits_enabled')) {
                $table->dropColumn('my_benefits_enabled');
            }
            if (Schema::hasColumn('profiles', 'permissions')) {
                $table->dropColumn('permissions');
            }
        });
    }
};
