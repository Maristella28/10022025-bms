<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            if (Schema::hasColumn('residents', 'residents_id')) {
                $table->dropColumn('residents_id');
            }
            if (Schema::hasColumn('residents', 'avatar')) {
                $table->dropColumn('avatar');
            }
            if (!Schema::hasColumn('residents', 'current_photo')) {
                $table->string('current_photo')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->unsignedBigInteger('residents_id')->nullable();
            $table->string('avatar')->nullable();
            $table->dropColumn('current_photo');
        });
    }
};
