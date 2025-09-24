<?php
// Test the reporting functionality using factory data
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\User;
use App\Models\Resident;
use Database\Factories\ResidentFactory;

echo "=== Testing Reporting Functionality with Factory Data ===\n\n";

// Create test admin user if not exists
$adminUser = User::firstOrCreate(
    ['email' => 'testadmin@example.com'],
    [
        'name' => 'Test Admin',
        'password' => Hash::make('password123'),
        'role' => 'admin'
    ]
);

// Create some test residents using the factory
$factory = new ResidentFactory();
$now = now();

// Create residents with different update statuses
$activeResident = Resident::create($factory->definition());
$activeResident->last_modified = $now->copy()->subDays(15); // Active (within 1 month)
$activeResident->for_review = false;
$activeResident->save();

$outdatedResident = Resident::create($factory->definition());
$outdatedResident->last_modified = $now->copy()->subMonths(8); // Outdated (6-12 months)
$outdatedResident->for_review = false;
$outdatedResident->save();

$needsVerificationResident = Resident::create($factory->definition());
$needsVerificationResident->last_modified = null; // Never updated - needs verification
$needsVerificationResident->for_review = true;
$needsVerificationResident->save();

echo "Created test residents:\n";
echo "- Active: {$activeResident->first_name} {$activeResident->last_name} (updated: {$activeResident->last_modified})\n";
echo "- Outdated: {$outdatedResident->first_name} {$outdatedResident->last_name} (updated: {$outdatedResident->last_modified})\n";
echo "- Needs Verification: {$needsVerificationResident->first_name} {$needsVerificationResident->last_name} (updated: N/A)\n\n";

// Test the report endpoint
try {
    $controller = new \App\Http\Controllers\ResidentController();
    $request = new Illuminate\Http\Request();
    
    echo "Testing ResidentController::report() with factory data...\n";
    
    $response = $controller->report($request);
    $data = $response->getData(true);
    
    echo "✓ Method executed successfully\n";
    echo "Status: " . $response->status() . "\n";
    echo "Total residents found: " . count($data['residents']) . "\n";
    echo "Total count in database: " . ($data['total_count'] ?? 0) . "\n\n";
    
    if (count($data['residents']) > 0) {
        echo "Residents found:\n";
        foreach ($data['residents'] as $resident) {
            $lastModified = $resident['last_modified'] ?? 'N/A';
            $forReview = $resident['for_review'] ? 'Yes' : 'No';
            echo "- {$resident['first_name']} {$resident['last_name']}: Last Modified: {$lastModified}, For Review: {$forReview}\n";
        }
    } else {
        echo "No residents found in the report\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== Test Complete ===\n";
