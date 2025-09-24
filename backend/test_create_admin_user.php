<?php
// Script to create a test admin user and generate a token
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create a test admin user
$user = User::create([
    'name' => 'Test Admin',
    'email' => 'testadmin@example.com',
    'password' => Hash::make('password123'), // Use a secure password
    'role' => 'admin', // Assign admin role
]);

// Generate a token for the user
$token = $user->createToken('TestToken')->plainTextToken;

echo "Test admin user created successfully.\n";
echo "Email: " . $user->email . "\n";
echo "Token: " . $token . "\n";
