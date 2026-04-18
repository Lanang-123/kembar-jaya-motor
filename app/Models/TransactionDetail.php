<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionDetail extends Model
{
    protected $fillable = [
        'transaction_id', 'product_id', 'service_id',
        'item_name', 'price', 'capital_price', 'quantity', 'subtotal'
    ];

    protected $casts = [
        'price' => 'integer',
        'capital_price' => 'integer',
        'quantity' => 'integer',
        'subtotal' => 'integer',
    ];

    // --- RELASI BARU YANG DITAMBAHKAN ---
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
