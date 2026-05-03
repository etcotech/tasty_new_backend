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
        Schema::create('pos_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('provider'); // foodics, rewaa, odoo, etc.
            $table->string('api_key')->nullable();
            $table->text('access_token')->nullable();
            $table->string('business_id')->nullable();
            $table->string('branch_id')->nullable();
            $table->boolean('is_enabled')->default(false);
            $table->string('environment')->default('sandbox'); // sandbox, live
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_integrations');
    }
};
