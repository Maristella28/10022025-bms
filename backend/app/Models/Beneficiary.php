<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'name',
        'beneficiary_type',
        'status',
        'my_benefits_enabled',
        'assistance_type',
        'amount',
        'contact_number',
        'email',
        'full_address',
        'application_date',
        'approved_date',
        'remarks',
        'attachment',
    ];

    public function disbursements()
    {
        return $this->hasMany(Disbursement::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    // Add resident relationship
    public function resident()
    {
        return $this->belongsTo(\App\Models\Resident::class, 'resident_id', 'id');
    }
}
