<?php
// Test the reporting functionality with existing data
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\User;
use App\Models\Resident;

echo "=== Testing Reporting Functionality ===\n\n";

// Get the total count of residents
$totalResidents = Resident::count();
echo "Total residents in database: {$totalResidents}\n";

if ($totalResidents > 0) {
    // Test the report endpoint with different filters
    $controller = new \App\Http\Controllers\ResidentController();
    
    echo "\n1. Testing report without filters:\n";
    $request = new Illuminate\Http\Request();
    $response = $controller->report($request);
    $data = $response->getData(true);
    echo "   Status: {$response->status()}\n";
    echo "   Residents found: " . count($data['residents']) . "\n";
    echo "   Total count: " . ($data['total_count'] ?? 0) . "\n";
    
    // Test with different filter parameters
    $testFilters = [
        'update_status' => 'active',
        'update_status' => 'outdated', 
        'update_status' => 'needs_verification',
        'update_status' => 'for_review'
    ];
    
    foreach ($testFilters as $key => $value) {
        echo "\n2. Testing report with filter: {$key}={$value}\n";
        $request = new Illuminate\Http\Request([$key => $value]);
        $response = $controller->report($request);
        $data = $response->getData(true);
        echo "   Status: {$response->status()}\n";
        echo "   Residents found: " . count($data['residents']) . "\n";
    }
    
    // Test batch review status check
    echo "\n3. Testing batch review status check:\n";
    $response = $controller->batchCheckReviewStatus();
    $data = $response->getData(true);
    echo "   Status: {$response->status()}\n";
    echo "   Message: " . ($data['message'] ?? 'No message') . "\n";
    
} else {
    echo "No residents found in database. Testing basic functionality...\n";
    
    $controller = new \App\Http\Controllers\ResidentController();
    $request = new Illuminate\Http\Request();
    $response = $controller->report($request);
    $data = $response->getData(true);
    
    echo "Report endpoint status: {$response->status()}\n";
    echo "Response structure: " . json_encode(array_keys($data)) . "\n";
}

echo "\n=== Test Complete ===\n";
