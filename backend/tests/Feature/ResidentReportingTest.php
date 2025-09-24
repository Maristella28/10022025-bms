<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Resident;
use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class ResidentReportingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user for testing
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@barangay.test',
            'password' => Hash::make('password'),
            'has_logged_in' => true,
        ]);

        // Create residents for testing
        $this->activeResident = $this->createResidentWithActivity(now()->subMonths(3)); // Active
        \Log::info('Active resident created:', ['id' => $this->activeResident->id]);
        
        $this->outdatedResident = $this->createResidentWithActivity(now()->subMonths(9)); // Outdated
        \Log::info('Outdated resident created:', ['id' => $this->outdatedResident->id]);
        
        $this->needsVerificationResident = $this->createResidentWithActivity(now()->subMonths(15)); // Needs verification
        \Log::info('Needs verification resident created:', ['id' => $this->needsVerificationResident->id]);
        
        $this->neverUpdatedResident = $this->createResident(null); // Never updated
        \Log::info('Never updated resident created:', ['id' => $this->neverUpdatedResident->id]);
    }

    /** @test */
    public function it_can_filter_residents_by_update_status()
    {
        // Test active filter
        $response = $this->actingAs($this->admin)->getJson('/api/admin/residents/report?update_status=active');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'residents');
        $this->assertEquals($this->activeResident->id, $response->json('residents.0.id'));

        // Test outdated filter
        $response = $this->actingAs($this->admin)->getJson('/api/admin/residents/report?update_status=outdated');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'residents');
        $this->assertEquals($this->outdatedResident->id, $response->json('residents.0.id'));

        // Test needs_verification filter
        $response = $this->actingAs($this->admin)->getJson('/api/admin/residents/report?update_status=needs_verification');
        $response->assertStatus(200);
        $response->assertJsonCount(2, 'residents'); // Should include both >12 months and never updated
    }

    /** @test */
    public function it_can_filter_residents_for_review()
    {
        // Create residents that should and shouldn't be flagged for review
        $forReviewResident = $this->createResidentWithActivity(now()->subMonths(13)); // Should be flagged
        $notForReviewResident = $this->createResidentWithActivity(now()->subMonths(6)); // Should not be flagged

        // Manually set the for_review flag since we haven't run the batch check
        $forReviewResident->update(['for_review' => true]);
        $notForReviewResident->update(['for_review' => false]);

        // Test for_review filter
        $response = $this->actingAs($this->admin)->getJson('/api/admin/residents/report?update_status=for_review');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'residents');
        $this->assertEquals($forReviewResident->id, $response->json('residents.0.id'));
    }

    /** @test */
    public function it_can_sort_residents_by_last_modified()
    {
        $resident1 = $this->createResidentWithActivity(now()->subMonths(3));
        $resident2 = $this->createResidentWithActivity(now()->subMonths(1));
        $resident3 = $this->createResidentWithActivity(now()->subMonths(6));

        // Test ascending sort
        $response = $this->actingAs($this->admin)->getJson('/api/admin/residents/report?sort_by=last_modified&sort_order=asc');
        $response->assertStatus(200);
        
        // Get all residents and filter to only include the ones we created in this test
        $allResidents = collect($response->json('residents'));
        $testResidents = $allResidents->filter(function ($resident) use ($resident1, $resident2, $resident3) {
            return in_array($resident['id'], [$resident1->id, $resident2->id, $resident3->id]);
        })->values();
        
        // Should be ordered from oldest to newest
        $this->assertEquals($resident3->id, $testResidents[0]['id']);
        $this->assertEquals($resident1->id, $testResidents[1]['id']);
        $this->assertEquals($resident2->id, $testResidents[2]['id']);

        // Test descending sort (default)
        $response = $this->actingAs($this->admin)->getJson('/api/admin/residents/report?sort_by=last_modified&sort_order=desc');
        $response->assertStatus(200);
        
        // Get all residents and filter to only include the ones we created in this test
        $allResidents = collect($response->json('residents'));
        $testResidents = $allResidents->filter(function ($resident) use ($resident1, $resident2, $resident3) {
            return in_array($resident['id'], [$resident1->id, $resident2->id, $resident3->id]);
        })->values();
        
        // Should be ordered from newest to oldest
        $this->assertEquals($resident2->id, $testResidents[0]['id']);
        $this->assertEquals($resident1->id, $testResidents[1]['id']);
        $this->assertEquals($resident3->id, $testResidents[2]['id']);
    }

    /** @test */
    public function it_can_batch_check_review_status()
    {
        $resident1 = $this->createResidentWithActivity(now()->subMonths(3)); // Active
        $resident2 = $this->createResidentWithActivity(now()->subMonths(13)); // Should be flagged
        $resident3 = $this->createResident(null); // Never updated

        // Run batch check
        $response = $this->actingAs($this->admin)->postJson('/api/admin/residents/batch-check-review');
        $response->assertStatus(200);

        // Refresh models to get updated values
        $resident1->refresh();
        $resident2->refresh();
        $resident3->refresh();

        // Assert correct review status
        $this->assertFalse($resident1->for_review); // Active, should not be flagged
        $this->assertTrue($resident2->for_review); // Inactive >12 months, should be flagged
        $this->assertTrue($resident3->for_review); // Never updated, should be flagged
    }

    /** @test */
    public function it_automatically_sets_last_modified_on_update()
    {
        $resident = $this->createResidentWithActivity(now()->subMonths(3));
        $originalLastModified = $resident->last_modified;

        // Update the resident
        $response = $this->actingAs($this->admin)->putJson("/api/admin/residents/{$resident->id}", [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'birth_date' => '1990-01-01',
            'birth_place' => 'Test City',
            'age' => 34,
            'email' => 'updated@test.com',
            'mobile_number' => '09123456789',
            'sex' => 'Male',
            'civil_status' => 'Single',
            'religion' => 'Test Religion',
            'current_address' => 'Test Address',
            'years_in_barangay' => 5,
            'voter_status' => 'Registered',
            'household_no' => 'TEST-001'
        ]);

        $response->assertStatus(200);
        
        $resident->refresh();
        
        // Last modified should be updated to current time
        $this->assertNotEquals($originalLastModified, $resident->last_modified);
        $this->assertTrue($resident->last_modified->isAfter($originalLastModified));
    }

    /** @test */
    public function it_returns_correct_total_count_in_report()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/residents/report');
        $response->assertStatus(200);
        $response->assertJson(['total_count' => 4]); // 4 residents created in setUp
    }

    private function createResidentWithActivity($lastModified)
    {
        $user = User::factory()->create([
            'has_logged_in' => true,
            'updated_at' => $lastModified
        ]);

        $profile = Profile::factory()->create([
            'user_id' => $user->id
        ]);

        return Resident::factory()->create([
            'user_id' => $user->id,
            'profile_id' => $profile->id,
            'last_modified' => $lastModified,
            'for_review' => false
        ]);
    }

    private function createResident($lastModified)
    {
        $user = User::factory()->create([
            'has_logged_in' => false
        ]);

        $profile = Profile::factory()->create([
            'user_id' => $user->id
        ]);

        return Resident::factory()->create([
            'user_id' => $user->id,
            'profile_id' => $profile->id,
            'last_modified' => $lastModified,
            'for_review' => false
        ]);
    }
}
