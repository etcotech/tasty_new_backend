<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('name')->nullable();
            $table->string('phone');
            $table->foreignId('first_order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('last_order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->unsignedInteger('orders_count')->default(0);
            $table->decimal('total_spent', 10, 2)->default(0);
            $table->timestamp('last_order_at')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_customers');
    }
};
