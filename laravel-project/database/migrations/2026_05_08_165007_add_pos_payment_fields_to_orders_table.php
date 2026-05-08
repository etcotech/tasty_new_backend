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
            $table->timestamp('paid_at')->nullable()->after('payment_status');
            $table->unsignedBigInteger('paid_by_staff_id')->nullable()->after('paid_at');
            $table->string('pos_terminal_reference')->nullable()->after('paid_by_staff_id');
            $table->string('pos_terminal_method')->nullable()->after('pos_terminal_reference');
            $table->text('pos_payment_note')->nullable()->after('pos_terminal_method');

            $table->foreign('paid_by_staff_id')->references('id')->on('restaurant_staff')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['paid_by_staff_id']);
            $table->dropColumn([
                'paid_at',
                'paid_by_staff_id',
                'pos_terminal_reference',
                'pos_terminal_method',
                'pos_payment_note'
            ]);
        });
    }
};
