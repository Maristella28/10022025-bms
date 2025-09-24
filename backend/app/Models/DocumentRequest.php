<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

/**
 * @property int $user_id
 * @property string $document_type
 * @property string|null $certification_type
 * @property array|null $fields
 * @property array|null $certification_data
 * @property string $status
 * @property string|null $processing_notes
 * @property string $priority
 * @property \Carbon\Carbon|null $estimated_completion
 * @property \Carbon\Carbon|null $completed_at
 * @property string|null $attachment
 * @property string|null $pdf_path
 * @property string|null $photo_path
 * @property string|null $photo_type
 * @property array|null $photo_metadata
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Resident|null $resident
 */
class DocumentRequest extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'user_id',
        'document_type',
        'certification_type',
        'fields',
        'certification_data',
        'status',
        'processing_notes',
        'priority',
        'estimated_completion',
        'completed_at',
        'attachment',
        'pdf_path',
        'photo_path',
        'photo_type',
        'photo_metadata',
    ];

    protected $casts = [
        'fields' => 'array',
        'certification_data' => 'array',
        'photo_metadata' => 'array',
        'estimated_completion' => 'date',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'user_id', 'user_id');
    }
} 