<?php
// Simple script to check the report API endpoint response
$url = 'http://localhost:8000/api/admin/residents/report';

echo "Testing API endpoint: $url\n\n";

// Try to get the response using file_get_contents with context
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "Accept: application/json\r\n",
        'timeout' => 10
    ]
]);

try {
    $response = @file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        $error = error_get_last();
        echo "Error accessing API: " . ($error['message'] ?? 'Unknown error') . "\n";
        echo "Make sure the Laravel server is running: php artisan serve\n";
        exit(1);
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "Invalid JSON response:\n";
        echo $response . "\n";
        exit(1);
    }
    
    echo "✅ API Response received successfully!\n\n";
    echo "Response structure:\n";
    echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
    
    if (isset($data['residents'])) {
        echo "✅ Found residents array with " . count($data['residents']) . " items\n";
        if (count($data['residents']) > 0) {
            $first = $data['residents'][0];
            echo "✅ Sample resident data:\n";
            echo "   - ID: " . ($first['id'] ?? 'N/A') . "\n";
            echo "   - Resident ID: " . ($first['resident_id'] ?? 'N/A') . "\n";
            echo "   - Name: " . ($first['first_name'] ?? '') . " " . ($first['last_name'] ?? '') . "\n";
            echo "   - Update Status: " . ($first['update_status'] ?? 'N/A') . "\n";
            echo "   - Last Modified: " . ($first['updated_at'] ?? 'N/A') . "\n";
        }
    } else {
        echo "❌ No residents array found in response\n";
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
