<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'resident_id',
        'program_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime'
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }
}
