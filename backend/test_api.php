<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    // Test if we can connect to the database
    echo "Testing database connection...\n";
    DB::connection()->getPdo();
    echo "✓ Database connection successful\n\n";
    
    // Check if residents table exists
    echo "Checking residents table...\n";
    $tableExists = DB::getSchemaBuilder()->hasTable('residents');
    echo $tableExists ? "✓ Residents table exists\n" : "✗ Residents table does not exist\n";
    
    if ($tableExists) {
        // Check columns in residents table
        echo "\nChecking columns in residents table:\n";
        $columns = DB::getSchemaBuilder()->getColumnListing('residents');
        foreach ($columns as $column) {
            echo "  - $column\n";
        }
        
        // Check if the new reporting fields exist
        echo "\nChecking for reporting fields:\n";
        $hasLastModified = in_array('last_modified', $columns);
        $hasForReview = in_array('for_review', $columns);
        
        echo $hasLastModified ? "✓ last_modified column exists\n" : "✗ last_modified column does NOT exist\n";
        echo $hasForReview ? "✓ for_review column exists\n" : "✗ for_review column does NOT exist\n";
        
        // Get sample data to see the structure
        echo "\nSample resident data (first 3 records):\n";
        $sampleResidents = DB::table('residents')->take(3)->get();
        foreach ($sampleResidents as $resident) {
            echo "Resident ID: " . ($resident->id ?? 'N/A') . "\n";
            echo "Last Modified: " . ($resident->last_modified ?? 'N/A') . "\n";
            echo "For Review: " . ($resident->for_review ?? 'N/A') . "\n";
            echo "---\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
