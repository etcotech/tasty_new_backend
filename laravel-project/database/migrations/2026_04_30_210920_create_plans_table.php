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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar');
            $table->string('name_en');
            $table->decimal('price', 10, 2);
            $table->string('billing_cycle')->default('monthly'); // monthly, yearly
            $table->integer('branches_limit')->nullable();
            $table->integer('monthly_orders_limit')->nullable();
            $table->integer('users_limit')->nullable();
            $table->json('allowed_order_types')->nullable();
            $table->boolean('has_kds')->default(false);
            $table->boolean('has_qr')->default(true);
            $table->boolean('has_automation')->default(false);
            $table->boolean('has_smart_orders')->default(false);
            $table->string('reports_level')->default('basic'); // basic, advanced, pro
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
