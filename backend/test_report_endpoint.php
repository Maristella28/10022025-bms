<?php
// Simple test script to verify the report endpoint returns data
require_once __DIR__ . '/vendor/autoload.php';

// Initialize Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Test the report endpoint
try {
    $controller = new App\Http\Controllers\Admin\ResidentController();
    $request = new Illuminate\Http\Request();
    
    // Call the report method
    $response = $controller->report($request);
    
    echo "Report endpoint test:\n";
    echo "Status: " . $response->status() . "\n";
    
    $data = $response->getData(true);
    echo "Response data structure: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    
    if (isset($data['residents'])) {
        echo "✓ Found residents array with " . count($data['residents']) . " items\n";
        if (count($data['residents']) > 0) {
            $firstResident = $data['residents'][0];
            echo "✓ First resident has ID: " . ($firstResident['id'] ?? 'N/A') . "\n";
            echo "✓ First resident update_status: " . ($firstResident['update_status'] ?? 'N/A') . "\n";
        }
    } else {
        echo "✗ No residents array found in response\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
