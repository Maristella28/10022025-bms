<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Household extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'households';

    protected $fillable = [
        'household_no',
        'address',
        'head_resident_id',
        'members_count',
        'created_by',
    ];

    protected $casts = [
        'members_count' => 'integer',
    ];

    public function residents()
    {
        return $this->hasMany(Resident::class, 'household_no', 'household_no');
    }

    public function head()
    {
        return $this->belongsTo(Resident::class, 'head_resident_id');
    }
}
