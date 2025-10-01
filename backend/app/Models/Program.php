<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'description',
        'start_date',
        'end_date',
        'beneficiary_type',
        'assistance_type',
        'amount',
        'status',
        'max_beneficiaries',
        'payout_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'payout_date' => 'datetime',
        'max_beneficiaries' => 'integer',
    ];

    public function applicationForms(): HasMany
    {
        return $this->hasMany(ProgramApplicationForms::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(ProgramAnnouncement::class);
    }
}
