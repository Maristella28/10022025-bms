<?php

/**
 * Database Verification Script for Barangay Certification System
 * 
 * This script verifies that all database components are properly set up
 * for the new Barangay Certification functionality.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Schema\Blueprint;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Setup database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => env('DB_CONNECTION', 'mysql'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "🔍 Barangay Certification System - Database Verification\n";
echo "=" . str_repeat("=", 55) . "\n\n";

$errors = [];
$warnings = [];
$success = [];

try {
    // Test database connection
    $pdo = $capsule->getConnection()->getPdo();
    $success[] = "✅ Database connection established successfully";
    
    // Check if document_requests table exists
    $schema = $capsule->schema();
    if ($schema->hasTable('document_requests')) {
        $success[] = "✅ document_requests table exists";
        
        // Check for new certification columns
        $requiredColumns = [
            'certification_type' => 'string',
            'certification_data' => 'json',
            'processing_notes' => 'text',
            'priority' => 'enum',
            'estimated_completion' => 'date',
            'completed_at' => 'timestamp'
        ];
        
        foreach ($requiredColumns as $column => $type) {
            if ($schema->hasColumn('document_requests', $column)) {
                $success[] = "✅ Column '{$column}' exists in document_requests table";
            } else {
                $errors[] = "❌ Missing column '{$column}' in document_requests table";
            }
        }
        
        // Check existing essential columns
        $essentialColumns = ['id', 'user_id', 'document_type', 'fields', 'status', 'pdf_path'];
        foreach ($essentialColumns as $column) {
            if ($schema->hasColumn('document_requests', $column)) {
                $success[] = "✅ Essential column '{$column}' exists";
            } else {
                $errors[] = "❌ Missing essential column '{$column}' in document_requests table";
            }
        }
        
    } else {
        $errors[] = "❌ document_requests table does not exist";
    }
    
    // Check if residents table exists and has correct fields
    if ($schema->hasTable('residents')) {
        $success[] = "✅ residents table exists";
        
        // Check for current_address vs full_address
        if ($schema->hasColumn('residents', 'current_address')) {
            $success[] = "✅ residents table uses 'current_address' field";
        } elseif ($schema->hasColumn('residents', 'full_address')) {
            $warnings[] = "⚠️  residents table still uses 'full_address' - consider updating to 'current_address'";
        } else {
            $errors[] = "❌ residents table missing address field";
        }
        
    } else {
        $errors[] = "❌ residents table does not exist";
    }
    
    // Check if users table exists
    if ($schema->hasTable('users')) {
        $success[] = "✅ users table exists";
    } else {
        $errors[] = "❌ users table does not exist";
    }
    
    // Test sample data insertion (if no errors so far)
    if (empty($errors)) {
        try {
            // Test inserting a sample certification request
            $testData = [
                'user_id' => 1,
                'document_type' => 'Brgy Certification',
                'certification_type' => 'Test Certification',
                'fields' => json_encode(['test' => 'data']),
                'certification_data' => json_encode(['test_field' => 'test_value']),
                'status' => 'pending',
                'priority' => 'normal',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $insertId = $capsule->table('document_requests')->insertGetId($testData);
            
            if ($insertId) {
                $success[] = "✅ Test data insertion successful (ID: {$insertId})";
                
                // Clean up test data
                $capsule->table('document_requests')->where('id', $insertId)->delete();
                $success[] = "✅ Test data cleanup successful";
            }
            
        } catch (Exception $e) {
            $errors[] = "❌ Test data insertion failed: " . $e->getMessage();
        }
    }
    
    // Check migration status
    if ($schema->hasTable('migrations')) {
        $migrationExists = $capsule->table('migrations')
            ->where('migration', 'like', '%add_certification_support_to_document_requests_table%')
            ->exists();
            
        if ($migrationExists) {
            $success[] = "✅ Certification migration is recorded in migrations table";
        } else {
            $warnings[] = "⚠️  Certification migration not found in migrations table - may need to run migration";
        }
    }
    
} catch (Exception $e) {
    $errors[] = "❌ Database connection failed: " . $e->getMessage();
}

// Display results
echo "📊 VERIFICATION RESULTS\n";
echo "-" . str_repeat("-", 23) . "\n\n";

if (!empty($success)) {
    echo "✅ SUCCESS (" . count($success) . " items)\n";
    foreach ($success as $item) {
        echo "   {$item}\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "⚠️  WARNINGS (" . count($warnings) . " items)\n";
    foreach ($warnings as $item) {
        echo "   {$item}\n";
    }
    echo "\n";
}

if (!empty($errors)) {
    echo "❌ ERRORS (" . count($errors) . " items)\n";
    foreach ($errors as $item) {
        echo "   {$item}\n";
    }
    echo "\n";
}

// Summary
echo "📋 SUMMARY\n";
echo "-" . str_repeat("-", 9) . "\n";
echo "Success: " . count($success) . " items\n";
echo "Warnings: " . count($warnings) . " items\n";
echo "Errors: " . count($errors) . " items\n\n";

if (empty($errors)) {
    echo "🎉 DATABASE VERIFICATION PASSED!\n";
    echo "The database is ready for the Barangay Certification system.\n\n";
    
    echo "📝 NEXT STEPS:\n";
    echo "1. Run 'php artisan migrate' to ensure all migrations are applied\n";
    echo "2. Run 'php artisan db:seed --class=CertificationSeeder' for sample data\n";
    echo "3. Test the frontend certification request functionality\n";
    echo "4. Test the admin panel certification management\n";
} else {
    echo "🚨 DATABASE VERIFICATION FAILED!\n";
    echo "Please fix the errors above before proceeding.\n\n";
    
    echo "🔧 RECOMMENDED ACTIONS:\n";
    echo "1. Run 'php artisan migrate' to apply missing migrations\n";
    echo "2. Check database connection settings in .env file\n";
    echo "3. Ensure database user has proper permissions\n";
    echo "4. Review migration files for any syntax errors\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "Verification completed at: " . date('Y-m-d H:i:s') . "\n";