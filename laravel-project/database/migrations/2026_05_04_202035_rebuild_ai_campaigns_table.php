<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // For SQLite, to remove CHECK constraints from ENUMs, we rebuild the table.
        // Rename existing
        Schema::rename('ai_campaigns', 'ai_campaigns_old');

        // Create new without enum CHECK constraints
        Schema::create('ai_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            // Using string instead of enum to avoid strict DB CHECK constraints
            $table->string('target_audience')->default('all'); 
            $table->string('status')->default('draft');
            $table->string('suggested_time_window')->nullable();
            $table->text('reason')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Dispatch fields
            $table->timestamp('sent_at')->nullable();
            $table->integer('target_count')->default(0);
            $table->text('failure_reason')->nullable();
        });

        // Copy data from old to new
        $oldData = DB::table('ai_campaigns_old')->get();
        foreach ($oldData as $row) {
            DB::table('ai_campaigns')->insert((array)$row);
        }

        // Drop old table
        Schema::dropIfExists('ai_campaigns_old');
    }

    public function down(): void
    {
        // Not necessary for this fix to be perfectly reversible, 
        // as going back would re-introduce the problematic enum constraints.
    }
};
