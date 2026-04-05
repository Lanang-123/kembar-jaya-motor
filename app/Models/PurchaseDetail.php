<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseDetail extends Model
{
    protected $fillable = ['purchase_id', 'product_id', 'quantity', 'purchase_price', 'subtotal'];

    protected $casts = [
        'quantity' => 'integer',
        'purchase_price' => 'integer',
        'subtotal' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
