<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Beneficiary;
use App\Models\Resident;
use App\Models\Profile;
use Illuminate\Support\Facades\DB;

echo "=== Testing Benefits Database Connection ===\n\n";

try {
    // Test database connection
    echo "1. Testing database connection...\n";
    DB::connection()->getPdo();
    echo "✅ Database connection successful\n\n";

    // Check beneficiaries table
    echo "2. Checking beneficiaries table...\n";
    $beneficiariesCount = Beneficiary::count();
    echo "✅ Found {$beneficiariesCount} beneficiaries\n\n";

    // Show sample beneficiaries
    echo "3. Sample beneficiaries:\n";
    $sampleBeneficiaries = Beneficiary::take(5)->get(['id', 'name', 'my_benefits_enabled', 'status']);
    foreach ($sampleBeneficiaries as $beneficiary) {
        echo "   - ID: {$beneficiary->id}, Name: {$beneficiary->name}, Benefits Enabled: " . ($beneficiary->my_benefits_enabled ? 'Yes' : 'No') . ", Status: {$beneficiary->status}\n";
    }
    echo "\n";

    // Check residents table
    echo "4. Checking residents table...\n";
    $residentsCount = Resident::count();
    echo "✅ Found {$residentsCount} residents\n\n";

    // Show sample residents
    echo "5. Sample residents:\n";
    $sampleResidents = Resident::with('profile')->take(5)->get(['id', 'first_name', 'last_name']);
    foreach ($sampleResidents as $resident) {
        $profile = $resident->profile;
        $benefitsEnabled = $profile ? ($profile->my_benefits_enabled ? 'Yes' : 'No') : 'No Profile';
        echo "   - ID: {$resident->id}, Name: {$resident->first_name} {$resident->last_name}, Benefits Enabled: {$benefitsEnabled}\n";
    }
    echo "\n";

    // Check profiles table
    echo "6. Checking profiles table...\n";
    $profilesCount = Profile::count();
    echo "✅ Found {$profilesCount} profiles\n\n";

    // Show sample profiles with benefits info
    echo "7. Sample profiles with benefits info:\n";
    $sampleProfiles = Profile::take(5)->get(['id', 'user_id', 'my_benefits_enabled', 'permissions']);
    foreach ($sampleProfiles as $profile) {
        $permissions = is_string($profile->permissions) ? json_decode($profile->permissions, true) : $profile->permissions;
        $permissionsMyBenefits = isset($permissions['my_benefits']) ? ($permissions['my_benefits'] ? 'Yes' : 'No') : 'Not Set';
        echo "   - ID: {$profile->id}, User ID: {$profile->user_id}, Benefits Enabled: " . ($profile->my_benefits_enabled ? 'Yes' : 'No') . ", Permissions.my_benefits: {$permissionsMyBenefits}\n";
    }
    echo "\n";

    // Test name matching
    echo "8. Testing name matching between beneficiaries and residents...\n";
    $beneficiary = Beneficiary::first();
    if ($beneficiary) {
        echo "   Testing with beneficiary: {$beneficiary->name}\n";
        $nameParts = explode(' ', trim($beneficiary->name));
        if (count($nameParts) >= 2) {
            $firstName = $nameParts[0];
            $lastName = end($nameParts);
            echo "   Searching for: First='{$firstName}', Last='{$lastName}'\n";
            
            $matchingResident = Resident::whereHas('profile', function($query) use ($firstName, $lastName) {
                $query->where('first_name', 'LIKE', '%' . $firstName . '%')
                      ->where('last_name', 'LIKE', '%' . $lastName . '%');
            })->with('profile')->first();
            
            if ($matchingResident) {
                echo "   ✅ Found matching resident: {$matchingResident->first_name} {$matchingResident->last_name}\n";
                echo "   Profile benefits enabled: " . ($matchingResident->profile->my_benefits_enabled ? 'Yes' : 'No') . "\n";
            } else {
                echo "   ❌ No matching resident found\n";
            }
        }
    }
    echo "\n";

    echo "=== Test Complete ===\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
