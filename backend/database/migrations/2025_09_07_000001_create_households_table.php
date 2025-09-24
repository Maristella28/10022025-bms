<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('households', function (Blueprint $table) {
            $table->id();
            $table->string('household_no')->unique();
            $table->string('address')->nullable();
            $table->unsignedBigInteger('head_resident_id')->nullable();
            $table->integer('members_count')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('household_no');
        });
    }

    public function down()
    {
        Schema::dropIfExists('households');
    }
};
