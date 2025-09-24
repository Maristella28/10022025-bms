<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profile extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'profiles'; // Explicitly define table name (optional but clear)


    protected $casts = [
        'birth_date' => 'date',
        'age' => 'integer',
        'years_in_barangay' => 'integer',
        'year_vaccinated' => 'integer',
        'head_of_family' => 'boolean',
        'business_outside_barangay' => 'boolean',
        'special_categories' => 'array',
        'vaccine_received' => 'array',
        'profile_completed' => 'boolean',
        'permissions' => 'json', // Changed from 'array' to 'json' for safer handling
        'my_benefits_enabled' => 'boolean',
    ];

    protected $fillable = [
        'user_id',
        'resident_id',
        'first_name',
        'middle_name',
        'last_name',
        'name_suffix',
        'birth_date',
        'birth_place',
        'age',
        'nationality',
        'sex',
        'civil_status',
        'religion',
        'relation_to_head',
        'email',
        'mobile_number',
        'current_address',
        'current_photo',
        'years_in_barangay',
        'voter_status',
        'voters_id_number',
        'voting_location',
        'housing_type',
        'head_of_family',
        'household_no',
        'classified_sector',
        'educational_attainment',
        'occupation_type',
        'salary_income',
        'business_info',
        'business_type',
        'business_location',
        'business_outside_barangay',
        'special_categories',
        'covid_vaccine_status',
        'vaccine_received',
        'other_vaccine',
        'year_vaccinated',
        'residency_verification_image',
        'verification_status',
        'denial_reason',
        'profile_completed',
        'permissions',
        'my_benefits_enabled',
    ];
    /**
     * Relationship: Profile belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Profile has one corresponding Resident record.
     * Mapping by residents_id for proper syncing.
     */
    public function resident()
    {
        // Link via the shared resident_id string column on both models
        return $this->hasOne(Resident::class, 'resident_id', 'resident_id');
    }
}
