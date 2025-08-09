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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('description');
            $table->enum('type', ['income', 'expense', 'receivable', 'payable']);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('source')->nullable(); // source/destination of transaction
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->timestamp('due_date')->nullable(); // for receivables and payables
            $table->json('metadata')->nullable(); // for storing additional data
            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
