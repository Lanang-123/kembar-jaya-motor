<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'supplier_id',
        'name',
        'sku',
        'stock',
        'unit',
        'purchase_price',
        'selling_price',
        'image',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'purchase_price' => 'integer',
        'selling_price' => 'integer',
        'stock' => 'integer',
    ];

    /**
     * Relasi ke tabel Supplier
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
