<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->string('hero_image_url')->nullable();
            $table->text('address_ar')->nullable();
            $table->text('address_en')->nullable();
            $table->boolean('is_open')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['hero_image_url', 'address_ar', 'address_en', 'is_open']);
        });
    }
};
