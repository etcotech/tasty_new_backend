<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qr_codes', function (Blueprint $table) {
            $table->softDeletes();
            $table->unsignedBigInteger('branch_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('qr_codes', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->unsignedBigInteger('branch_id')->nullable(false)->change();
        });
    }
};
