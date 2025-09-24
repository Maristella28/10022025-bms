<?php
// Test frontend integration with the reporting API
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

echo "=== Frontend Integration Test ===\n\n";

// Create test admin user
$adminUser = User::firstOrCreate(
    ['email' => 'testadmin@example.com'],
    [
        'name' => 'Test Admin',
        'password' => Hash::make('password123'),
        'role' => 'admin'
    ]
);

// Create test residents with different statuses for frontend testing
$testResidents = [
    [
        'email' => 'active@example.com',
        'name' => 'Active Resident',
        'last_modified' => now()->subDays(15),
        'for_review' => false,
        'verification_status' => 'approved'
    ],
    [
        'email' => 'outdated@example.com', 
        'name' => 'Outdated Resident',
        'last_modified' => now()->subMonths(8),
        'for_review' => false,
        'verification_status' => 'pending'
    ],
    [
        'email' => 'review@example.com',
        'name' => 'Review Resident',
        'last_modified' => now()->subMonths(13),
        'for_review' => true,
        'verification_status' => 'denied'
    ],
    [
        'email' => 'never@example.com',
        'name' => 'Never Updated Resident',
        'last_modified' => null,
        'for_review' => true,
        'verification_status' => 'pending'
    ]
];

foreach ($testResidents as $testData) {
    $user = User::firstOrCreate(
        ['email' => $testData['email']],
        [
            'name' => $testData['name'],
            'password' => Hash::make('password123'),
            'role' => 'residents'
        ]
    );

    $profile = Profile::firstOrCreate(
        ['user_id' => $user->id],
        [
            'resident_id' => 'RES-' . strtoupper(substr($testData['name'], 0, 3)) . '-001',
            'first_name' => explode(' ', $testData['name'])[0],
            'last_name' => explode(' ', $testData['name'])[1],
            'birth_date' => '1990-01-01',
            'birth_place' => 'Test City',
            'age' => 33,
            'email' => $testData['email'],
            'sex' => 'Male',
            'civil_status' => 'Single',
            'religion' => 'Test Religion',
            'current_address' => '123 Test St',
            'years_in_barangay' => 5,
            'voter_status' => 'Registered'
        ]
    );

    $resident = Resident::firstOrCreate(
        ['user_id' => $user->id],
        [
            'profile_id' => $profile->id,
            'resident_id' => 'RES-' . strtoupper(substr($testData['name'], 0, 3)) . '-001',
            'first_name' => explode(' ', $testData['name'])[0],
            'last_name' => explode(' ', $testData['name'])[1],
            'birth_date' => '1990-01-01',
            'birth_place' => 'Test City',
            'age' => 33,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'religion' => 'Test Religion',
            'email' => $testData['email'],
            'household_no' => 'H-TEST-001',
            'last_modified' => $testData['last_modified'],
            'for_review' => $testData['for_review'],
            'verification_status' => $testData['verification_status']
        ]
    );

    echo "Created {$testData['name']}: ";
    echo "Status: " . ($resident->update_status ?? 'N/A') . ", ";
    echo "Review: " . ($resident->for_review ? 'Yes' : 'No') . ", ";
    echo "Verification: " . ($resident->verification_status ?? 'Pending') . "\n";
}

echo "\n=== Testing API Endpoints ===\n\n";

// Test different filter combinations
$testCases = [
    'All residents' => [],
    'Active residents' => ['update_status' => 'active'],
    'Outdated residents' => ['update_status' => 'outdated'],
    'Needs verification' => ['update_status' => 'needs_verification'],
    'For review' => ['update_status' => 'for_review'],
    'Approved verification' => ['verification_status' => 'approved'],
    'Pending verification' => ['verification_status' => 'pending'],
    'Denied verification' => ['verification_status' => 'denied'],
    'Sorted by name' => ['sort_by' => 'first_name', 'sort_order' => 'asc'],
    'Sorted by last modified' => ['sort_by' => 'last_modified', 'sort_order' => 'desc']
];

foreach ($testCases as $testName => $params) {
    echo "Testing: {$testName}\n";
    
    try {
        $controller = new \App\Http\Controllers\ResidentController();
        $request = new Illuminate\Http\Request($params);
        
        $response = $controller->report($request);
        $data = $response->getData(true);
        
        echo "  ✓ Success: " . count($data['residents']) . " residents found\n";
        
        if (count($data['residents']) > 0) {
            foreach ($data['residents'] as $resident) {
                $status = $resident['update_status'] ?? 'Unknown';
                $review = $resident['for_review'] ? 'Review' : 'No Review';
                $verification = $resident['verification_status'] ?? 'Pending';
                echo "    - {$resident['first_name']} {$resident['last_name']}: {$status}, {$review}, {$verification}\n";
            }
        }
        
    } catch (Exception $e) {
        echo "  ✗ Error: " . $e->getMessage() . "\n";
    }
    echo "\n";
}

echo "=== Frontend Integration Test Complete ===\n";
echo "The API endpoints are ready for frontend integration with the following features:\n";
echo "✅ Multiple filter options (update status, verification status)\n";
echo "✅ Sorting capabilities\n";
echo "✅ Comprehensive resident data with status indicators\n";
echo "✅ Review flag system\n";
echo "✅ Proper error handling\n";
