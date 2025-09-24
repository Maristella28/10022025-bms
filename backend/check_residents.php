<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $count = DB::table('residents')->count();
    echo "Total residents in database: " . $count . "\n";
    
    // Check if the new reporting fields exist
    $columns = DB::getSchemaBuilder()->getColumnListing('residents');
    echo "Columns in residents table: " . implode(', ', $columns) . "\n";
    
    // Check if last_modified and for_review columns exist
    if (in_array('last_modified', $columns)) {
        echo "✓ last_modified column exists\n";
    } else {
        echo "✗ last_modified column does NOT exist\n";
    }
    
    if (in_array('for_review', $columns)) {
        echo "✓ for_review column exists\n";
    } else {
        echo "✗ for_review column does NOT exist\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
