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
public function up(): void
{
    Schema::table('residents', function (Blueprint $table) {
        // Add the correct columns first
        $table->string('resident_id')->unique()->after('user_id');
        $table->string('mobile_number')->after('email');
        $table->text('current_address')->after('mobile_number');
        $table->string('current_photo')->nullable()->after('current_address');
    });

    // Then copy the data from old columns to new ones
    DB::statement('UPDATE residents SET resident_id = residents_id');
    DB::statement('UPDATE residents SET mobile_number = contact_number');
    DB::statement('UPDATE residents SET current_address = full_address');
    DB::statement('UPDATE residents SET current_photo = avatar');

    // Drop the old columns
    Schema::table('residents', function (Blueprint $table) {
        $table->dropColumn(['residents_id', 'contact_number', 'full_address', 'avatar']);
    });
}

public function down(): void
{
    Schema::table('residents', function (Blueprint $table) {
        $table->string('residents_id')->unique();
        $table->string('contact_number');
        $table->text('full_address');
        $table->string('avatar')->nullable();
    });

    // Restore old column data
    DB::statement('UPDATE residents SET residents_id = resident_id');
    DB::statement('UPDATE residents SET contact_number = mobile_number');
    DB::statement('UPDATE residents SET full_address = current_address');
    DB::statement('UPDATE residents SET avatar = current_photo');

    // Drop new columns
    Schema::table('residents', function (Blueprint $table) {
        $table->dropColumn(['resident_id', 'mobile_number', 'current_address', 'current_photo']);
    });
}

};
