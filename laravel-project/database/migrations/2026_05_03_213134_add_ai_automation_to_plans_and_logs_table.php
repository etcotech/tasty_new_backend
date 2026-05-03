<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->boolean('has_ai_automation')->default(false)->after('has_smart_orders');
        });

        Schema::create('ai_automation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('type');
            $table->json('input_summary')->nullable();
            $table->text('output_text');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_automation_logs');
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('has_ai_automation');
        });
    }
};
