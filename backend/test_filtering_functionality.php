<?php
// Test filtering functionality with residents in different status categories
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

echo "=== Testing Filtering Functionality ===\n\n";

// Create test admin user
$adminUser = User::firstOrCreate(
    ['email' => 'testadmin@example.com'],
    [
        'name' => 'Test Admin',
        'password' => Hash::make('password123'),
        'role' => 'admin'
    ]
);

$now = now();

// Create residents in different status categories
$statusCategories = [
    'active' => $now->copy()->subDays(15),      // Within 1 month
    'outdated' => $now->copy()->subMonths(8),    // 6-12 months ago
    'needs_verification' => null,                // Never updated
    'for_review' => $now->copy()->subMonths(13) // Over 12 months
];

foreach ($statusCategories as $status => $lastModified) {
    $email = "{$status}@example.com";
    
    // Create user
    $user = User::firstOrCreate(
        ['email' => $email],
        [
            'name' => ucfirst($status) . ' Resident',
            'password' => Hash::make('password123'),
            'role' => 'residents'
        ]
    );

    // Create profile
    $profile = Profile::firstOrCreate(
        ['user_id' => $user->id],
        [
            'resident_id' => "RES-{$status}-001",
            'first_name' => ucfirst($status),
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'birth_place' => 'Test City',
            'age' => 33,
            'email' => $email,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'religion' => 'Test Religion',
            'current_address' => '123 Test St',
            'years_in_barangay' => 5,
            'voter_status' => 'Registered'
        ]
    );

    // Create resident
    $resident = Resident::firstOrCreate(
        ['user_id' => $user->id],
        [
            'profile_id' => $profile->id,
            'resident_id' => "RES-{$status}-001",
            'first_name' => ucfirst($status),
            'last_name' => 'Resident',
            'birth_date' => '1990-01-01',
            'birth_place' => 'Test City',
            'age' => 33,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'religion' => 'Test Religion',
            'email' => $email,
            'household_no' => "H-{$status}-001",
            'last_modified' => $lastModified,
            'for_review' => ($status === 'for_review' || $status === 'needs_verification')
        ]
    );

    echo "Created {$status} resident: {$resident->first_name} {$resident->last_name}\n";
    echo "  Last Modified: " . ($resident->last_modified ?? 'N/A') . "\n";
    echo "  For Review: " . ($resident->for_review ? 'Yes' : 'No') . "\n\n";
}

// Test the report endpoint with different filters
$controller = new \App\Http\Controllers\ResidentController();

$filters = [
    'active' => ['update_status' => 'active'],
    'outdated' => ['update_status' => 'outdated'],
    'needs_verification' => ['update_status' => 'needs_verification'],
    'for_review' => ['update_status' => 'for_review']
];

foreach ($filters as $filterName => $filterParams) {
    echo "Testing filter: {$filterName}\n";
    
    $request = new Illuminate\Http\Request($filterParams);
    $response = $controller->report($request);
    $data = $response->getData(true);
    
    echo "  Status: {$response->status()}\n";
    echo "  Residents found: " . count($data['residents']) . "\n";
    
    if (count($data['residents']) > 0) {
        foreach ($data['residents'] as $resident) {
            $lastModified = $resident['last_modified'] ?? 'N/A';
            $forReview = $resident['for_review'] ? 'Yes' : 'No';
            echo "  - {$resident['first_name']} {$resident['last_name']}: {$lastModified}, For Review: {$forReview}\n";
        }
    }
    echo "\n";
}

echo "=== Filtering Test Complete ===\n";
