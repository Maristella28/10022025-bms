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
        // Create staff table if it doesn't exist
        if (!Schema::hasTable('staff')) {
            Schema::create('staff', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('name');
                $table->string('email');
                $table->string('department');
                $table->string('position');
                $table->string('contact_number');
                $table->date('birthdate');
                $table->string('gender');
                $table->string('civil_status');
                $table->text('address')->nullable();
                $table->string('resident_id')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });
            return;
        }

        // If table exists but has old columns, drop them
        if (Schema::hasColumn('staff', 'password')) {
            Schema::table('staff', function (Blueprint $table) {
                $table->dropColumn([
                    'password',
                    'remember_token',
                    'role'
                ]);
            });
        }
        
        // Add or update columns
        Schema::table('staff', function (Blueprint $table) {
            if (!Schema::hasColumn('staff', 'user_id')) {
                $table->foreignId('user_id')->after('id')->constrained('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('staff', 'position')) {
                $table->string('position')->after('department');
            }
            if (!Schema::hasColumn('staff', 'birthdate')) {
                $table->date('birthdate')->after('contact_number');
            }
            if (!Schema::hasColumn('staff', 'gender')) {
                $table->string('gender')->after('birthdate');
            }
            if (!Schema::hasColumn('staff', 'civil_status')) {
                $table->string('civil_status')->after('gender');
            }
            if (!Schema::hasColumn('staff', 'address')) {
                $table->text('address')->nullable()->after('civil_status');
            }
            if (!Schema::hasColumn('staff', 'resident_id')) {
                $table->string('resident_id')->nullable()->after('address');
            }
            if (!Schema::hasColumn('staff', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('staff')) {
            return;
        }

        Schema::table('staff', function (Blueprint $table) {
            // Only try to add back columns if they don't exist
            if (!Schema::hasColumn('staff', 'password')) {
                $table->string('password')->nullable();
            }
            if (!Schema::hasColumn('staff', 'remember_token')) {
                $table->string('remember_token', 100)->nullable();
            }
            if (!Schema::hasColumn('staff', 'role')) {
                $table->string('role')->default('staff');
            }
            
            // Only drop columns if they exist
            if (Schema::hasColumn('staff', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
            if (Schema::hasColumn('staff', 'position')) {
                $table->dropColumn('position');
            }
            if (Schema::hasColumn('staff', 'birthdate')) {
                $table->dropColumn('birthdate');
            }
            if (Schema::hasColumn('staff', 'gender')) {
                $table->dropColumn('gender');
            }
            if (Schema::hasColumn('staff', 'civil_status')) {
                $table->dropColumn('civil_status');
            }
            if (Schema::hasColumn('staff', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('staff', 'resident_id')) {
                $table->dropColumn('resident_id');
            }
            
            // Drop soft deletes if they exist
            if (Schema::hasColumn('staff', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
