<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Beneficiary;
use App\Models\Resident;
use App\Models\Profile;
use App\Http\Controllers\ResidentProfileController;
use Illuminate\Http\Request;

echo "=== Testing Benefits Fix ===\n\n";

try {
    // Test the new getBenefitsStatusFromBeneficiaries method
    echo "1. Testing benefits status detection...\n";
    
    // Get a sample resident
    $resident = Resident::with('profile')->first();
    if (!$resident) {
        echo "❌ No residents found in database\n";
        exit;
    }
    
    echo "Testing with resident: {$resident->first_name} {$resident->last_name}\n";
    
    // Create a mock request
    $request = new Request();
    $request->setUserResolver(function () use ($resident) {
        return (object) ['id' => $resident->user_id];
    });
    
    // Test the profile controller
    $controller = new ResidentProfileController();
    $response = $controller->show($request);
    $data = json_decode($response->getContent(), true);
    
    echo "Profile response received:\n";
    echo "  - my_benefits_enabled: " . ($data['profile']['my_benefits_enabled'] ? 'true' : 'false') . "\n";
    echo "  - permissions.my_benefits: " . (isset($data['profile']['permissions']['my_benefits']) ? ($data['profile']['permissions']['my_benefits'] ? 'true' : 'false') : 'not set') . "\n";
    echo "  - source: " . ($data['source'] ?? 'unknown') . "\n\n";
    
    // Check beneficiaries for this resident
    echo "2. Checking beneficiaries for this resident...\n";
    $beneficiaries = Beneficiary::where('my_benefits_enabled', true)
        ->where('status', 'Approved')
        ->where(function($query) use ($resident) {
            $firstName = trim($resident->first_name);
            $lastName = trim($resident->last_name);
            
            if ($firstName && $lastName) {
                $query->where('name', 'LIKE', '%' . $firstName . '%')
                      ->where('name', 'LIKE', '%' . $lastName . '%');
            }
        })
        ->get();
    
    echo "Found {$beneficiaries->count()} matching beneficiaries:\n";
    foreach ($beneficiaries as $beneficiary) {
        echo "  - ID: {$beneficiary->id}, Name: {$beneficiary->name}, Benefits: " . ($beneficiary->my_benefits_enabled ? 'Enabled' : 'Disabled') . ", Status: {$beneficiary->status}\n";
    }
    echo "\n";
    
    // Test with a specific beneficiary
    echo "3. Testing with a specific beneficiary...\n";
    $testBeneficiary = Beneficiary::where('my_benefits_enabled', true)
        ->where('status', 'Approved')
        ->first();
    
    if ($testBeneficiary) {
        echo "Testing with beneficiary: {$testBeneficiary->name}\n";
        echo "  - Benefits enabled: " . ($testBeneficiary->my_benefits_enabled ? 'Yes' : 'No') . "\n";
        echo "  - Status: {$testBeneficiary->status}\n";
        
        // Try to find matching resident
        $nameParts = explode(' ', trim($testBeneficiary->name));
        if (count($nameParts) >= 2) {
            $firstName = $nameParts[0];
            $lastName = end($nameParts);
            
            $matchingResident = Resident::where('first_name', 'LIKE', '%' . $firstName . '%')
                ->where('last_name', 'LIKE', '%' . $lastName . '%')
                ->first();
            
            if ($matchingResident) {
                echo "  - Found matching resident: {$matchingResident->first_name} {$matchingResident->last_name}\n";
                
                // Test profile fetch for this resident
                $request->setUserResolver(function () use ($matchingResident) {
                    return (object) ['id' => $matchingResident->user_id];
                });
                
                $response = $controller->show($request);
                $data = json_decode($response->getContent(), true);
                
                echo "  - Profile my_benefits_enabled: " . ($data['profile']['my_benefits_enabled'] ? 'true' : 'false') . "\n";
                echo "  - Profile permissions.my_benefits: " . (isset($data['profile']['permissions']['my_benefits']) ? ($data['profile']['permissions']['my_benefits'] ? 'true' : 'false') : 'not set') . "\n";
            } else {
                echo "  - No matching resident found\n";
            }
        }
    } else {
        echo "No approved beneficiaries with benefits enabled found\n";
    }
    
    echo "\n=== Test Complete ===\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
