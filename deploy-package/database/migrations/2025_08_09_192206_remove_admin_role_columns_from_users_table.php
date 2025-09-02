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
        Schema::table('users', function (Blueprint $table) {
            // Remove only the old admin columns, keep the new role system
            $table->dropColumn([
                'is_admin',
                'admin_granted_at',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restore only the old admin columns
            $table->boolean('is_admin')->default(false);
            $table->timestamp('admin_granted_at')->nullable();
        });
    }
};
