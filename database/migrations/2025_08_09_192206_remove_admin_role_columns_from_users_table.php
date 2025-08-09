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
            // Remove admin and role related columns
            $table->dropColumn([
                'is_admin',
                'admin_granted_at',
                'role',
                'permissions',
                'is_active',
                'last_login_at',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restore admin and role related columns
            $table->boolean('is_admin')->default(false);
            $table->timestamp('admin_granted_at')->nullable();
            $table->enum('role', ['user', 'admin', 'super_admin'])->default('user');
            $table->json('permissions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
        });
    }
};
