<?php
// Test to verify route registration and middleware configuration
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "=== Route Registration Test ===\n\n";

// Get all registered routes
$routes = \Illuminate\Support\Facades\Route::getRoutes();

echo "Total routes registered: " . count($routes) . "\n\n";

// Look for the specific route
$found = false;
foreach ($routes as $route) {
    $uri = $route->uri();
    $methods = $route->methods();
    $action = $route->getActionName();
    
    if (strpos($uri, 'admin/residents/report') !== false) {
        $found = true;
        echo "✓ Found route: " . $uri . "\n";
        echo "  Methods: " . implode(', ', $methods) . "\n";
        echo "  Action: " . $action . "\n";
        
        // Check middleware
        $middleware = $route->middleware();
        echo "  Middleware: " . implode(', ', $middleware) . "\n";
        
        break;
    }
}

if (!$found) {
    echo "✗ Route 'admin/residents/report' not found in registered routes\n";
    
    // List all routes for debugging
    echo "\nAll API routes:\n";
    foreach ($routes as $route) {
        $uri = $route->uri();
        if (strpos($uri, 'api/') === 0) {
            echo "  - " . $uri . " (" . implode(', ', $route->methods()) . ")\n";
        }
    }
}

echo "\n=== Middleware Configuration ===\n";
$middlewareGroups = $app->make('router')->getMiddlewareGroups();
echo "Available middleware groups:\n";
foreach ($middlewareGroups as $group => $middlewares) {
    echo "  $group: " . implode(', ', $middlewares) . "\n";
}

echo "\n=== Test Complete ===\n";
