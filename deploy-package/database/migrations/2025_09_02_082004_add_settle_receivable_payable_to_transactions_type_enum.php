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
            // Update the type enum to include 'settle_receivable' and 'settle_payable'
            $table->enum('type', ['income', 'expense', 'receivable', 'payable', 'settlement', 'settle_receivable', 'settle_payable'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Revert back to previous enum values
            $table->enum('type', ['income', 'expense', 'receivable', 'payable', 'settlement'])->change();
        });
    }
};
