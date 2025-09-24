<?php
// Simple test to verify the API endpoint works correctly
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "=== API Endpoint Test ===\n\n";

// Test the report endpoint directly
try {
    $controller = new \App\Http\Controllers\ResidentController();
    $request = new Illuminate\Http\Request();
    
    echo "Testing ResidentController::report() method...\n";
    
    $response = $controller->report($request);
    $data = $response->getData(true);
    
    echo "✓ Method executed successfully\n";
    echo "Status: " . $response->status() . "\n";
    
    if (isset($data['residents'])) {
        echo "✓ Residents array found with " . count($data['residents']) . " items\n";
        echo "✓ Total count: " . ($data['total_count'] ?? 0) . "\n";
        
        if (count($data['residents']) > 0) {
            $first = $data['residents'][0];
            echo "✓ Sample data structure:\n";
            echo "  - ID: " . ($first['id'] ?? 'N/A') . "\n";
            echo "  - Resident ID: " . ($first['resident_id'] ?? 'N/A') . "\n";
            echo "  - Name: " . ($first['first_name'] ?? '') . " " . ($first['last_name'] ?? '') . "\n";
            echo "  - Update Status: " . ($first['update_status'] ?? 'N/A') . "\n";
            echo "  - Last Modified: " . ($first['updated_at'] ?? 'N/A') . "\n";
        }
    } else {
        echo "✗ No residents array found\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== Route Testing ===\n";

// Test if the route is properly configured
try {
    $route = \Illuminate\Support\Facades\Route::getRoutes()->getByName('api.admin.residents.report');
    if ($route) {
        echo "✓ Route found: " . $route->uri() . "\n";
        echo "✓ Method: " . implode(',', $route->methods()) . "\n";
        echo "✓ Controller: " . $route->getActionName() . "\n";
    } else {
        echo "✗ Route not found\n";
    }
} catch (Exception $e) {
    echo "✗ Route testing error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
