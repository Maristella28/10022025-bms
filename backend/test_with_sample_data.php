<?php
// Test with sample resident data to verify reporting functionality
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\User;
use App\Models\Resident;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;

echo "=== Testing Reporting Functionality with Sample Data ===\n\n";

// Create test admin user if not exists
$adminUser = User::firstOrCreate(
    ['email' => 'testadmin@example.com'],
    [
        'name' => 'Test Admin',
        'password' => Hash::make('password123'),
        'role' => 'admin'
    ]
);

// Create some test residents with different update statuses
$now = now();

// Active resident (updated within last month)
$activeUser = User::firstOrCreate(
    ['email' => 'active@example.com'],
    [
        'name' => 'Active Resident',
        'password' => Hash::make('password123'),
        'role' => 'residents'
    ]
);

$activeProfile = Profile::firstOrCreate(
    ['user_id' => $activeUser->id],
    [
        'resident_id' => 'RES-ACTIVE-001',
        'first_name' => 'Active',
        'last_name' => 'Resident',
        'birth_date' => '1990-01-01',
        'birth_place' => 'Test City',
        'age' => 33,
        'email' => 'active@example.com',
        'mobile_number' => '09123456789',
        'sex' => 'Male',
        'civil_status' => 'Single',
        'religion' => 'Test Religion',
        'current_address' => '123 Test St',
        'years_in_barangay' => 5,
        'voter_status' => 'Registered'
    ]
);

$activeResident = Resident::firstOrCreate(
    ['user_id' => $activeUser->id],
    [
        'profile_id' => $activeProfile->id,
        'resident_id' => 'RES-ACTIVE-001',
        'first_name' => 'Active',
        'last_name' => 'Resident',
        'household_no' => 'H-001',
        'last_modified' => $now->copy()->subDays(15), // Active (within 1 month)
        'for_review' => false
    ]
);

// Outdated resident (updated 8 months ago)
$outdatedUser = User::firstOrCreate(
    ['email' => 'outdated@example.com'],
    [
        'name' => 'Outdated Resident',
        'password' => Hash::make('password123'),
        'role' => 'residents'
    ]
);

$outdatedProfile = Profile::firstOrCreate(
    ['user_id' => $outdatedUser->id],
    [
        'resident_id' => 'RES-OUTDATED-001',
        'first_name' => 'Outdated',
        'last_name' => 'Resident',
        'birth_date' => '1985-01-01',
        'birth_place' => 'Test City',
        'age' => 38,
        'email' => 'outdated@example.com',
        'mobile_number' => '09123456790',
        'sex' => 'Female',
        'civil_status' => 'Married',
        'religion' => 'Test Religion',
        'current_address' => '456 Test St',
        'years_in_barangay' => 8,
        'voter_status' => 'Registered'
    ]
);

$outdatedResident = Resident::firstOrCreate(
    ['user_id' => $outdatedUser->id],
    [
        'profile_id' => $outdatedProfile->id,
        'resident_id' => 'RES-OUTDATED-001',
        'first_name' => 'Outdated',
        'last_name' => 'Resident',
        'household_no' => 'H-002',
        'last_modified' => $now->copy()->subMonths(8), // Outdated (6-12 months)
        'for_review' => false
    ]
);

// Needs verification resident (never updated)
$needsVerificationUser = User::firstOrCreate(
    ['email' => 'needsverify@example.com'],
    [
        'name' => 'Needs Verification Resident',
        'password' => Hash::make('password123'),
        'role' => 'residents'
    ]
);

$needsVerificationProfile = Profile::firstOrCreate(
    ['user_id' => $needsVerificationUser->id],
    [
        'resident_id' => 'RES-NEEDSVERIFY-001',
        'first_name' => 'Needs',
        'last_name' => 'Verification',
        'birth_date' => '1975-01-01',
        'birth_place' => 'Test City',
        'age' => 48,
        'email' => 'needsverify@example.com',
        'mobile_number' => '09123456791',
        'sex' => 'Male',
        'civil_status' => 'Widowed',
        'religion' => 'Test Religion',
        'current_address' => '789 Test St',
        'years_in_barangay' => 12,
        'voter_status' => 'Unregistered'
    ]
);

$needsVerificationResident = Resident::firstOrCreate(
    ['user_id' => $needsVerificationUser->id],
    [
        'profile_id' => $needsVerificationProfile->id,
        'resident_id' => 'RES-NEEDSVERIFY-001',
        'first_name' => 'Needs',
        'last_name' => 'Verification',
        'household_no' => 'H-003',
        'last_modified' => null, // Never updated - needs verification
        'for_review' => true
    ]
);

echo "Created test residents:\n";
echo "- Active: {$activeResident->first_name} {$activeResident->last_name} (updated: {$activeResident->last_modified})\n";
echo "- Outdated: {$outdatedResident->first_name} {$outdatedResident->last_name} (updated: {$outdatedResident->last_modified})\n";
echo "- Needs Verification: {$needsVerificationResident->first_name} {$needsVerificationResident->last_name} (updated: N/A)\n\n";

// Test the report endpoint
try {
    $controller = new \App\Http\Controllers\ResidentController();
    $request = new Illuminate\Http\Request();
    
    echo "Testing ResidentController::report() with sample data...\n";
    
    $response = $controller->report($request);
    $data = $response->getData(true);
    
    echo "✓ Method executed successfully\n";
    echo "Status: " . $response->status() . "\n";
    echo "Total residents found: " . count($data['residents']) . "\n";
    echo "Total count in database: " . ($data['total_count'] ?? 0) . "\n\n";
    
    if (count($data['residents']) > 0) {
        echo "Residents found:\n";
        foreach ($data['residents'] as $resident) {
            $status = $resident['update_status'] ?? 'Unknown';
            $lastModified = $resident['last_modified'] ?? 'N/A';
            echo "- {$resident['first_name']} {$resident['last_name']}: {$status} (Last Modified: {$lastModified})\n";
        }
    } else {
        echo "No residents found in the report\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== Test Complete ===\n";
