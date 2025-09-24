<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Resident;
use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class ResidentReportingSimpleTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_access_report_endpoint_without_auth()
    {
        // Temporarily disable auth middleware for testing
        $this->withoutMiddleware();
        
        $response = $this->getJson('/api/admin/residents/report');
        
        // This should return 200 even without auth since we disabled middleware
        $response->assertStatus(200);
    }

    /** @test */
    public function it_can_access_batch_check_endpoint_without_auth()
    {
        // Temporarily disable auth middleware for testing
        $this->withoutMiddleware();
        
        $response = $this->postJson('/api/admin/residents/batch-check-review');
        
        // This should return 200 even without auth since we disabled middleware
        $response->assertStatus(200);
    }
}
