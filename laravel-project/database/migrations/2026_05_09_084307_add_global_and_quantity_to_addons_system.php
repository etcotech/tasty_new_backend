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
        if (!Schema::hasColumn('addons', 'is_global')) {
            Schema::table('addons', function (Blueprint $table) {
                $table->boolean('is_global')->default(false)->after('is_active');
            });
        }

        Schema::table('order_item_addons', function (Blueprint $table) {
            if (!Schema::hasColumn('order_item_addons', 'quantity')) {
                $table->integer('quantity')->default(1)->after('price');
            }
            if (!Schema::hasColumn('order_item_addons', 'total')) {
                $table->decimal('total', 10, 2)->default(0)->after('quantity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            $table->dropColumn('is_global');
        });

        Schema::table('order_item_addons', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'total']);
        });
    }
};
