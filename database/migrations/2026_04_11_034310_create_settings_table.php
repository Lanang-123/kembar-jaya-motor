<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('shop_name')->default('KEMBAR JAYA MOTOR');
            $table->text('shop_address')->nullable();
            $table->string('shop_phone')->nullable();
            $table->string('signature_name')->default('I Made Martika Yasa');
            $table->string('signature_role')->default('Ka_Bengkel');
            $table->text('invoice_footer')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
