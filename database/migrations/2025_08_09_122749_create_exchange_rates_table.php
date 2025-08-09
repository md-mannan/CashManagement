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
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('from_currency', 3);
            $table->string('to_currency', 3);
            $table->decimal('rate', 15, 8);
            $table->string('source')->default('exchangerate-api.com');
            $table->timestamp('fetched_at');
            $table->timestamps();

            // Indexes for performance
            $table->unique(['from_currency', 'to_currency']);
            $table->index(['from_currency', 'to_currency', 'fetched_at']);
            $table->index('fetched_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
