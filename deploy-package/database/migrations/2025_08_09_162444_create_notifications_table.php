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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // success, info, warning, error
            $table->string('title');
            $table->text('message');
            $table->string('icon')->nullable(); // lucide icon name
            $table->string('color')->default('blue'); // blue, green, yellow, red, purple, etc.
            $table->json('data')->nullable(); // additional data for the notification
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_important')->default(false);
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
