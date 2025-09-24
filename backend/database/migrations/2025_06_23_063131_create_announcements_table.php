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
        Schema::table('announcements', function (Blueprint $table) {
            // Only add if columns don't exist yet
            if (!Schema::hasColumn('announcements', 'title')) {
                $table->string('title');
            }

            if (!Schema::hasColumn('announcements', 'content')) {
                $table->text('content');
            }

            if (!Schema::hasColumn('announcements', 'image')) {
                $table->string('image')->nullable(); // ✅ renamed from 'photo'
            }

            if (!Schema::hasColumn('announcements', 'published_at')) {
                $table->timestamp('published_at')->nullable(); // ✅ add publish date
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
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn(['title', 'content', 'image', 'published_at']);
        });
    }
};
