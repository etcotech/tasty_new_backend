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
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('payment_method'); // enum or string
            $table->string('payment_status');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('SAR');
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->string('provider')->nullable();
            $table->string('provider_transaction_id')->nullable();
            $table->string('terminal_reference')->nullable();
            $table->string('terminal_method')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('staff_id')->references('id')->on('restaurant_staff')->onDelete('set null');
            $table->unique(['order_id', 'payment_method', 'payment_status'], 'payment_logs_unique_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};
