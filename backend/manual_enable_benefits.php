<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Profile;
use App\Models\Resident;

echo "=== Manual Benefits Enable Script ===\n\n";

// Get user input for resident ID or email
$residentId = readline("Enter Resident ID (or press Enter to list residents): ");

if (empty($residentId)) {
    echo "Available residents:\n";
    $residents = Resident::with('profile')->take(10)->get(['id', 'first_name', 'last_name', 'email']);
    foreach ($residents as $resident) {
        $profile = $resident->profile;
        $benefitsEnabled = $profile ? ($profile->my_benefits_enabled ? 'Yes' : 'No') : 'No Profile';
        echo "   - ID: {$resident->id}, Name: {$resident->first_name} {$resident->last_name}, Email: {$resident->email}, Benefits: {$benefitsEnabled}\n";
    }
    echo "\n";
    $residentId = readline("Enter Resident ID to enable benefits: ");
}

if (empty($residentId)) {
    echo "No resident ID provided. Exiting.\n";
    exit;
}

try {
    // Find resident
    $resident = Resident::with('profile')->find($residentId);
    
    if (!$resident) {
        echo "❌ Resident not found with ID: {$residentId}\n";
        exit;
    }

    echo "Found resident: {$resident->first_name} {$resident->last_name}\n";
    
    if (!$resident->profile) {
        echo "❌ Resident has no profile. Cannot enable benefits.\n";
        exit;
    }

    $profile = $resident->profile;
    echo "Current benefits status: " . ($profile->my_benefits_enabled ? 'Enabled' : 'Disabled') . "\n";
    echo "Current permissions: " . json_encode($profile->permissions) . "\n\n";

    $enable = readline("Enable benefits? (y/n): ");
    
    if (strtolower($enable) === 'y' || strtolower($enable) === 'yes') {
        // Normalize permissions
        $permissions = $profile->permissions ?? [];
        if (is_string($permissions)) {
            $decoded = json_decode($permissions, true);
            $permissions = is_array($decoded) ? $decoded : [];
        }
        if (!is_array($permissions)) {
            $permissions = (array) $permissions;
        }

        // Set the my_benefits flag in permissions
        $permissions['my_benefits'] = true;
        
        // Update both the permissions and the explicit boolean field
        $profile->permissions = $permissions;
        $profile->my_benefits_enabled = true;
        $profile->save();

        echo "✅ Benefits enabled successfully!\n";
        echo "Updated permissions: " . json_encode($profile->permissions) . "\n";
        echo "Updated my_benefits_enabled: " . ($profile->my_benefits_enabled ? 'true' : 'false') . "\n";
    } else {
        echo "Benefits not changed.\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
