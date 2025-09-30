<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApplicationFormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'field_name',
        'field_label',
        'field_type',
        'field_description',
        'is_required',
        'field_options',
        'validation_rules',
        'sort_order',
        'is_active'
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'field_options' => 'array',
        'validation_rules' => 'array',
        'is_active' => 'boolean'
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(ProgramApplicationForms::class, 'form_id');
    }

    public function submissionData(): HasMany
    {
        return $this->hasMany(ApplicationSubmissionData::class, 'field_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
