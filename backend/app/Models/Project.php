<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'owner',
        'deadline',
        'status',
        'photo',
        'published',
        'completed_at',
        'remarks',
        'uploaded_files',
        'created_by_admin'
    ];

    protected $casts = [
        'deadline' => 'date',
        'completed_at' => 'datetime',
        'uploaded_files' => 'array',
        'published' => 'boolean',
        'created_by_admin' => 'boolean',
    ];
}
