<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'license_plate',
        'brand',
        'customer_name',
        'customer_phone',
        'last_service_date',
    ];

    protected $casts = [
        'last_service_date' => 'date',
    ];
}
