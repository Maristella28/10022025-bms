<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramAnnouncement extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'title',
        'content',
        'status',
        'published_at',
        'expires_at',
        'is_urgent',
        'target_audience'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_urgent' => 'boolean',
        'target_audience' => 'array'
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now())
                    ->where(function($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    public function scopeUrgent($query)
    {
        return $query->where('is_urgent', true);
    }
}
