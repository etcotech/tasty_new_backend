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
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->unique()->constrained()->onDelete('cascade');
            $table->text('paymob_api_key')->nullable();
            $table->string('paymob_integration_id')->nullable();
            $table->string('paymob_iframe_id')->nullable();
            $table->string('paymob_hmac_secret')->nullable();
            $table->string('currency')->default('SAR');
            $table->enum('mode', ['test', 'live'])->default('test');
            $table->boolean('is_enabled')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_gateways');
    }
};
