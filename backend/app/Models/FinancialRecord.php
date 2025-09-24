<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'type',
        'category',
        'amount',
        'description',
        'reference',
        'approved_by',
        'status',
        'attachment',
    ];

    protected $casts = [
        'amount' => 'float',
        'date' => 'date',
    ];
} 