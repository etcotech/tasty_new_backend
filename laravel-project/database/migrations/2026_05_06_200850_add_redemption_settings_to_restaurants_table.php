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
        Schema::table('restaurants', function (Blueprint $table) {
            $table->integer('min_points_to_redeem')->default(100);
            $table->decimal('points_redeem_value', 10, 2)->default(10.00);
            $table->decimal('min_cashback_to_redeem', 10, 2)->default(10.00);
            $table->decimal('max_wallet_discount_percentage', 5, 2)->default(30.00);
            $table->decimal('min_order_amount_for_wallet_redeem', 10, 2)->default(50.00);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn([
                'min_points_to_redeem',
                'points_redeem_value',
                'min_cashback_to_redeem',
                'max_wallet_discount_percentage',
                'min_order_amount_for_wallet_redeem'
            ]);
        });
    }
};
