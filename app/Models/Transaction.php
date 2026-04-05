<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number', 'vehicle_id', 'total_amount',
        'payment_amount', 'change_amount', 'payment_method', 'notes', 'status'
    ];

    protected $casts = [
        'total_amount' => 'integer',
        'payment_amount' => 'integer',
        'change_amount' => 'integer',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
