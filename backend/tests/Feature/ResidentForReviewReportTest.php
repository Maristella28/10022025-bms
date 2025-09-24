<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Resident;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class ResidentForReviewReportTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function report_endpoint_returns_for_review_and_update_status()
    {
        // disable middleware for this request to simplify auth in CI
        $this->withoutMiddleware();

        // Create residents with varying last_modified dates
        $now = Carbon::now();

        // Active (updated 2 months ago)
        $active = Resident::factory()->create([
            'first_name' => 'Active',
            'last_name' => 'User',
            'last_modified' => $now->subMonths(2)->toDateTimeString(),
        ]);

        // Outdated (8 months ago)
        $outdated = Resident::factory()->create([
            'first_name' => 'Outdated',
            'last_name' => 'User',
            'last_modified' => $now->subMonths(8)->toDateTimeString(),
        ]);

        // Needs Verification / For Review (18 months ago)
        $needsReview = Resident::factory()->create([
            'first_name' => 'Needs',
            'last_name' => 'Review',
            'last_modified' => $now->subMonths(18)->toDateTimeString(),
        ]);

        // Hit the report endpoint
        $response = $this->getJson('/api/admin/residents/report');

        $response->assertStatus(200);
        $json = $response->json();

        $this->assertArrayHasKey('residents', $json);
        $residents = collect($json['residents']);

        // Check that our residents are present and have computed fields
        $this->assertTrue($residents->contains(fn($r) => $r['id'] === $active->id && ($r['update_status'] === 'Active' || strtolower($r['update_status']) === 'active')));
        $this->assertTrue($residents->contains(fn($r) => $r['id'] === $outdated->id && ($r['update_status'] === 'Outdated' || strtolower($r['update_status']) === 'outdated')));
        $this->assertTrue($residents->contains(fn($r) => $r['id'] === $needsReview->id && ($r['update_status'] === 'Needs Verification' || strtolower($r['update_status']) === 'needs_verification' || $r['for_review'])));
    }
}
