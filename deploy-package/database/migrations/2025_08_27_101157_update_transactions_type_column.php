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
        Schema::table('transactions', function (Blueprint $table) {
            // Update the type enum to include 'settlement'
            $table->enum('type', ['income', 'expense', 'receivable', 'payable', 'settlement'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('type', ['income', 'expense', 'receivable', 'payable'])->change();
        });
    }
};
