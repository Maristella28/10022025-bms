<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'beneficiary_type',
        'assistance_type',
        'amount',
        'status',
        'max_beneficiaries',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'max_beneficiaries' => 'integer',
    ];
}
