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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->default('cash')->after('order_type');
            $table->string('payment_status')->default('pending')->after('payment_method');
            $table->string('payment_provider')->nullable()->after('payment_status');
            $table->string('payment_reference')->nullable()->after('payment_provider');
            $table->string('paymob_order_id')->nullable()->after('payment_reference');
            $table->string('paymob_transaction_id')->nullable()->after('paymob_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'payment_provider',
                'payment_reference',
                'paymob_order_id',
                'paymob_transaction_id'
            ]);
        });
    }
};
