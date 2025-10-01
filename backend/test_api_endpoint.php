<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\ProgramApplicationFormController;
use Illuminate\Http\Request;

echo "Testing qualified residents API endpoint...\n";

try {
    $controller = new ProgramApplicationFormController();
    $request = new Request();
    
    echo "Calling getQualifiedResidents with programId: 3\n";
    $response = $controller->getQualifiedResidents($request, '3');
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content: " . $response->getContent() . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}