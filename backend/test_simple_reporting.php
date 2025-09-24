<?php
// Simple test for reporting functionality
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

echo "=== Simple Reporting Functionality Test ===\n\n";

// Create test admin user
$adminUser = User::firstOrCreate(
    ['email' => 'testadmin@example.com'],
    [
        'name' => 'Test Admin',
        'password' => Hash::make('password123'),
        'role' => 'admin'
    ]
);

// Create a simple test resident with minimal required fields
$testUser = User::firstOrCreate(
    ['email' => 'testresident@example.com'],
    [
        'name' => 'Test Resident',
        'password' => Hash::make('password123'),
        'role' => 'residents'
    ]
);

// Create profile first
$profile = Profile::firstOrCreate(
    ['user_id' => $testUser->id],
    [
        'resident_id' => 'TEST-RES-001',
        'first_name' => 'Test',
        'last_name' => 'Resident',
        'birth_date' => '1990-01-01',
        'birth_place' => 'Test City',
        'age' => 33,
        'email' => 'testresident@example.com',
        'sex' => 'Male',
        'civil_status' => 'Single',
        'religion' => 'Test Religion',
        'current_address' => '123 Test St',
        'years_in_barangay' => 5,
        'voter_status' => 'Registered'
    ]
);

// Create resident with minimal required fields
$resident = Resident::firstOrCreate(
    ['user_id' => $testUser->id],
    [
        'profile_id' => $profile->id,
        'resident_id' => 'TEST-RES-001',
        'first_name' => 'Test',
        'last_name' => 'Resident',
        'birth_date' => '1990-01-01',
        'birth_place' => 'Test City',
        'age' => 33,
        'sex' => 'Male',
        'civil_status' => 'Single',
        'religion' => 'Test Religion',
        'email' => 'testresident@example.com',
        'household_no' => 'H-TEST-001',
        'last_modified' => now()->subDays(15),
        'for_review' => false
    ]
);

echo "Created test resident: {$resident->first_name} {$resident->last_name}\n";
echo "Last Modified: {$resident->last_modified}\n";
echo "For Review: " . ($resident->for_review ? 'Yes' : 'No') . "\n\n";

// Test the report endpoint
try {
    $controller = new \App\Http\Controllers\ResidentController();
    $request = new Illuminate\Http\Request();
    
    echo "Testing ResidentController::report()...\n";
    
    $response = $controller->report($request);
    $data = $response->getData(true);
    
    echo "✓ Method executed successfully\n";
    echo "Status: {$response->status()}\n";
    echo "Total residents found: " . count($data['residents']) . "\n";
    echo "Total count in database: " . ($data['total_count'] ?? 0) . "\n\n";
    
    if (count($data['residents']) > 0) {
        echo "Residents found:\n";
        foreach ($data['residents'] as $residentData) {
            $lastModified = $residentData['last_modified'] ?? 'N/A';
            $forReview = $residentData['for_review'] ? 'Yes' : 'No';
            echo "- {$residentData['first_name']} {$residentData['last_name']}: Last Modified: {$lastModified}, For Review: {$forReview}\n";
        }
    } else {
        echo "No residents found in the report\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== Test Complete ===\n";
