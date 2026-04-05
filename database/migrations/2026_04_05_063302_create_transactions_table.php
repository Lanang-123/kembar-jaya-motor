<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->string('invoice_number')->unique();
        $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();

        // Keuangan
        $table->bigInteger('total_amount')->default(0);
        $table->bigInteger('payment_amount')->default(0);
        $table->bigInteger('change_amount')->default(0);

        // Metode Pembayaran (Cash, Transfer, QRIS)
        $table->string('payment_method')->default('CASH');
        $table->text('notes')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
