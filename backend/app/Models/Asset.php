<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    protected $fillable = [
        'name', 'description', 'image', 'price', 'category', 'stock', 'status', 'available_dates'
    ];

    protected $casts = [
        'available_dates' => 'array',
    ];

    public function requests()
    {
        return $this->hasMany(AssetRequest::class);
    }

    public function resident()
    {
        return $this->belongsTo(User::class, 'resident_id');
    }
} 