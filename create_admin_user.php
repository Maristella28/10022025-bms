<?php

// Script to create an admin user for the barangay e-governance system
$url = 'http://localhost:8000/api/register'; // Adjust the URL if needed

$data = [
    'name' => 'Barangay Mamatid Admin',
    'email' => 'brgymamatid.egovsystem@gmail.com',
    'password' => 'Egovbrgymamatid2025',
    'role' => 'admin'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n";
echo "Response: " . $response . "\n";

if ($httpCode === 201) {
    echo "✅ Admin user created successfully!\n";
    $responseData = json_decode($response, true);
    echo "User ID: " . $responseData['user_id'] . "\n";
    echo "Email: " . $responseData['email'] . "\n";
    echo "Note: You'll need to verify the email using the verification code sent.\n";
} else {
    echo "❌ Failed to create admin user. Check if the server is running.\n";
    echo "Make sure to run: php artisan serve\n";
}
