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
            // Add missing columns for installer functionality
            $table->string('locale', 5)->default('en')->after('timezone');
            $table->boolean('enable_notifications')->default(true)->after('force_password_change');
            $table->boolean('enable_activity_logging')->default(true)->after('enable_notifications');
            $table->boolean('enable_backup')->default(true)->after('enable_activity_logging');
            $table->boolean('enable_social_login')->default(false)->after('enable_backup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove added columns
            $table->dropColumn([
                'locale',
                'enable_notifications',
                'enable_activity_logging',
                'enable_backup',
                'enable_social_login'
            ]);
        });
    }
};
