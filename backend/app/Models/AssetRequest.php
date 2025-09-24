<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetRequest extends Model
{
    protected $fillable = [
        'user_id', 'resident_id', 'status', 'admin_message', 
        'payment_status', 'receipt_number', 'amount_paid', 'paid_at'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'amount_paid' => 'decimal:2',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class, 'resident_id');
    }

    public function items()
    {
        return $this->hasMany(AssetRequestItem::class);
    }

    public function generateReceiptNumber()
    {
        try {
            $prefix = 'AR';
            $year = date('Y');
            $month = date('m');
            
            // Get the last receipt number for this month
            $lastReceipt = self::where('receipt_number', 'like', $prefix . $year . $month . '%')
                ->orderBy('receipt_number', 'desc')
                ->first();
            
            if ($lastReceipt && $lastReceipt->receipt_number) {
                $lastNumber = (int) substr($lastReceipt->receipt_number, -4);
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }
            
            return $prefix . $year . $month . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        } catch (\Exception $e) {
            // Fallback receipt number if there's any error
            return 'AR' . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        }
    }

    public function calculateTotalAmount()
    {
        try {
            return $this->items->sum(function ($item) {
                $price = $item->asset ? $item->asset->price : 0;
                $quantity = $item->quantity ?: 0;
                return $price * $quantity;
            });
        } catch (\Exception $e) {
            return 0;
        }
    }
} 