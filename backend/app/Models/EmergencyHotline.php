<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyHotline extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'hotline',
        'description',
        'status',
        'last_updated',
        'contact_person',
        'email',
        'procedure',
    ];

    protected $casts = [
        'procedure' => 'array',
        'last_updated' => 'date',
    ];
}
