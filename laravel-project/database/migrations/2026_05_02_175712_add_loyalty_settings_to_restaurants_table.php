<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->boolean('points_enabled')->default(false);
            $table->boolean('cashback_enabled')->default(false);
            $table->integer('points_rate')->default(10);
            $table->decimal('cashback_percentage', 5, 2)->default(5);
            $table->decimal('min_order_amount', 8, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn([
                'points_enabled',
                'cashback_enabled',
                'points_rate',
                'cashback_percentage',
                'min_order_amount',
            ]);
        });
    }
};
