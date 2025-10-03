<?php

// Test file access for debugging
$baseUrl = 'http://localhost:8000';
$testFiles = [
    'uploads/projects/files/',
    'uploads/projects/'
];

echo "Testing file access...\n\n";

foreach ($testFiles as $path) {
    $fullPath = __DIR__ . '/public/' . $path;
    echo "Checking directory: $fullPath\n";
    
    if (is_dir($fullPath)) {
        $files = scandir($fullPath);
        $fileCount = 0;
        
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $fileCount++;
                $filePath = $fullPath . '/' . $file;
                $fileUrl = $baseUrl . '/' . $path . $file;
                
                echo "  File: $file\n";
                echo "  Local path: $filePath\n";
                echo "  URL: $fileUrl\n";
                echo "  Exists: " . (file_exists($filePath) ? 'YES' : 'NO') . "\n";
                echo "  Size: " . (file_exists($filePath) ? filesize($filePath) . ' bytes' : 'N/A') . "\n";
                echo "  MIME: " . (file_exists($filePath) ? mime_content_type($filePath) : 'N/A') . "\n";
                echo "  ---\n";
            }
        }
        
        echo "Total files in $path: $fileCount\n\n";
    } else {
        echo "  Directory does not exist!\n\n";
    }
}

echo "Test completed.\n";
