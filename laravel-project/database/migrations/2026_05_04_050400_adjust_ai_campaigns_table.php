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
        Schema::table('ai_campaigns', function (Blueprint $table) {
            $table->renameColumn('target_type', 'target_audience');
            $table->renameColumn('target_reason', 'reason');
        });

        // SQLite doesn't support changing column types/enums easily in Schema::table
        // So we might need to be careful if we strictly want to change the enum values.
        // For now, renaming covers the naming requirement.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_campaigns', function (Blueprint $table) {
            $table->renameColumn('target_audience', 'target_type');
            $table->renameColumn('reason', 'target_reason');
        });
    }
};
