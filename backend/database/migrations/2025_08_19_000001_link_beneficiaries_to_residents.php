<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        // Link beneficiaries to residents by matching name (customize as needed)
        $beneficiaries = DB::table('beneficiaries')->get();
        foreach ($beneficiaries as $b) {
            $nameParts = explode(' ', $b->name);
            $firstName = $nameParts[0] ?? null;
            $lastName = $nameParts[1] ?? null;
            if ($firstName && $lastName) {
                $resident = DB::table('residents')
                    ->where('first_name', 'like', "%$firstName%")
                    ->where('last_name', 'like', "%$lastName%")
                    ->first();
                if ($resident) {
                    DB::table('beneficiaries')->where('id', $b->id)->update(['resident_id' => $resident->id]);
                }
            }
        }
    }
    public function down() {
        // Optionally set resident_id to null
        DB::table('beneficiaries')->update(['resident_id' => null]);
    }
};
