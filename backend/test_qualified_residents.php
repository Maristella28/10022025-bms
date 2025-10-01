<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Resident;
use App\Models\ProgramApplicationForms;
use App\Models\ApplicationSubmission;

echo "Testing qualified residents logic...\n";

try {
    // Get all published forms for program 3
    $publishedForms = ProgramApplicationForms::where('program_id', 3)
        ->where('status', 'published')
        ->get();

    echo "Published forms count: " . $publishedForms->count() . "\n";
    
    if ($publishedForms->count() > 0) {
        $formIds = $publishedForms->pluck('id');
        echo "Form IDs: " . $formIds->implode(', ') . "\n";
        
        // Test the whereHas query
        $residentsWithApprovals = Resident::whereHas('applicationSubmissions', function ($query) use ($formIds) {
            $query->whereIn('form_id', $formIds)
                  ->where('status', 'approved');
        })->get();
        
        echo "Residents with approvals count: " . $residentsWithApprovals->count() . "\n";
        
        if ($residentsWithApprovals->count() > 0) {
            foreach ($residentsWithApprovals as $resident) {
                echo "Resident ID: " . $resident->id . ", Name: " . $resident->first_name . " " . $resident->last_name . "\n";
                
                // Check their submissions
                $submissions = $resident->applicationSubmissions()->whereIn('form_id', $formIds)->get();
                echo "  Submissions count: " . $submissions->count() . "\n";
                foreach ($submissions as $sub) {
                    echo "    Form ID: " . $sub->form_id . ", Status: " . $sub->status . "\n";
                }
            }
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
