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
        if (Schema::hasTable('staff')) {
            // Drop existing columns if they exist
            Schema::table('staff', function (Blueprint $table) {
                $columns = ['password', 'remember_token', 'role'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('staff', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
            
            // Add new columns if they don't exist
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('staff')) {
            Schema::table('staff', function (Blueprint $table) {
                // Drop the columns we added
                $columns = [
                    'user_id',
                    'position',
                    'birthdate',
                    'gender',
                    'civil_status',
                    'address',
                    'resident_id',
                    'deleted_at'
                ];
                
                foreach ($columns as $column) {
                    if (Schema::hasColumn('staff', $column)) {
                        if ($column === 'user_id') {
                            $table->dropForeign(['user_id']);
                        }
                        $table->dropColumn($column);
                    }
                }
            });

            // Add back original columns
            Schema::table('staff', function (Blueprint $table) {
                $table->string('password');
                $table->rememberToken();
                $table->string('role')->default('staff');
            });
        }
    }
};
