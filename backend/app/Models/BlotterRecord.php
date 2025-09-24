<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlotterRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_number',
        'resident_id',
        'complainant_name',
        'respondent_name',
        'complaint_type',
        'complaint_details',
        'incident_date',
        'incident_time',
        'incident_location',
        'witnesses',
        'supporting_documents',
        'preferred_action',
        'contact_number',
        'email',
        'remarks',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'resident_id');
    }
} 