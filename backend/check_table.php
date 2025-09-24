<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

try {
    if (Schema::hasTable('residents')) {
        echo "Residents table exists.\n";
        
        $columns = Schema::getColumnListing('residents');
        echo "Columns: " . implode(', ', $columns) . "\n";
        
        // Check specific columns
        echo "Has residents_id: " . (Schema::hasColumn('residents', 'residents_id') ? 'YES' : 'NO') . "\n";
        echo "Has resident_id: " . (Schema::hasColumn('residents', 'resident_id') ? 'YES' : 'NO') . "\n";
        echo "Has last_modified: " . (Schema::hasColumn('residents', 'last_modified') ? 'YES' : 'NO') . "\n";
        echo "Has for_review: " . (Schema::hasColumn('residents', 'for_review') ? 'YES' : 'NO') . "\n";
    } else {
        echo "Residents table does not exist.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
