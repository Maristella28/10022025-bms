<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $casts = [
        'permissions' => 'array',
        'module_permissions' => 'array',
        'email_verified_at' => 'datetime',
        'active' => 'boolean'
    ];

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'department',
        'position',
        'contact_number',
        'birthdate',
        'gender',
        'permissions',
        'module_permissions',
        'civil_status',
        'address',
        'resident_id',
        'active'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}