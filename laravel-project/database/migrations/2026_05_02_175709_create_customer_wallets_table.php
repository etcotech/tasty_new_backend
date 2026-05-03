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
        Schema::create('customer_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('phone')->index();
            $table->integer('points')->default(0);
            $table->decimal('cashback_balance', 10, 2)->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->timestamps();

            // Unique combination of restaurant and phone
            $table->unique(['restaurant_id', 'phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_wallets');
    }
};
