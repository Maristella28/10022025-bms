<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationSubmissionData extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'field_id',
        'field_value',
        'file_path',
        'file_original_name',
        'file_mime_type',
        'file_size'
    ];

    protected $casts = [
        'file_size' => 'integer'
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(ApplicationSubmission::class, 'submission_id');
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(ApplicationFormField::class, 'field_id');
    }

    public function isFile(): bool
    {
        return !is_null($this->file_path);
    }

    public function getFileUrl(): ?string
    {
        if (!$this->isFile()) {
            return null;
        }
        
        return asset('storage/' . $this->file_path);
    }
}
