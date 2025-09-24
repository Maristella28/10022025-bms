<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DisasterEmergencyRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'date',
        'location',
        'description',
        'actions_taken',
        'casualties',
        'reported_by',
    ];
} 