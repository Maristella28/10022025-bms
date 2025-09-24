<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlotterRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'resident_id',
        'status',
        'admin_message',
        'approved_date',
        'ticket_number',
        // Add more fields as needed
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'resident_id');
    }
}
