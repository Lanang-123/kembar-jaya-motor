<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'shop_name',
        'shop_address',
        'shop_phone',
        'signature_name',
        'signature_role',
        'invoice_footer',
    ];
}
