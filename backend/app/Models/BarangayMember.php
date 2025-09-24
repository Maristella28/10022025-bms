<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BarangayMember extends Model
{
    use HasFactory, SoftDeletes;

    // Allow mass assignment for these fields
    protected $fillable = [
        'name',
        'position',
        'role',
        'image',
        'description',
        'user_id',
    ];

    // Relationship: BarangayMember belongs to a User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
