<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramApplicationForms extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'title',
        'description',
        'status',
        'published_at',
        'deadline',
        'allow_multiple_submissions',
        'form_settings'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'deadline' => 'datetime',
        'allow_multiple_submissions' => 'boolean',
        'form_settings' => 'array'
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(ApplicationFormField::class, 'form_id')->orderBy('sort_order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ApplicationSubmission::class, 'form_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'published')
                    ->where(function($q) {
                        $q->whereNull('deadline')
                          ->orWhere('deadline', '>', now());
                    });
    }
}
