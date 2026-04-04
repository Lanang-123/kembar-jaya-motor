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
    Schema::create('suppliers', function (Blueprint $table) {
        $table->id();

        $table->string('name'); // Nama Perusahaan/Toko Supplierr
        $table->string('contact_person')->nullable(); // Nama sales/orang yang bisa dihubungi
        $table->string('phone', 20)->nullable(); // Nomor WA/Telepon
        $table->text('address')->nullable(); // Alamat untuk retur barang
        $table->string('email')->nullable();
        $table->boolean('is_active')->default(true); // Soft hapus, agar data tidak benar-benar hilang jika ada transaksi terikat

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
