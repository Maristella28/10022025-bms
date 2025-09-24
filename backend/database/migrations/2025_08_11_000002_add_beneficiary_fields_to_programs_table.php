<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->string('beneficiary_type')->nullable()->after('end_date');
            $table->string('assistance_type')->nullable()->after('beneficiary_type');
            $table->decimal('amount', 12, 2)->nullable()->after('assistance_type');
        });
    }

    public function down()
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['beneficiary_type', 'assistance_type', 'amount']);
        });
    }
};
