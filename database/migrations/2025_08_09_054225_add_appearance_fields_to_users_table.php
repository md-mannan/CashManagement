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
            $table->enum('appearance_mode', ['light', 'dark', 'system'])->default('system')->after('exchange_rate');
            $table->enum('theme', ['neutral', 'violet', 'blue', 'green', 'orange', 'red'])->default('neutral')->after('appearance_mode');
            $table->string('timezone', 50)->default('UTC')->after('theme');
            $table->string('date_format', 20)->default('Y-m-d')->after('timezone');
            $table->string('time_format', 10)->default('H:i')->after('date_format');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'appearance_mode',
                'theme',
                'timezone',
                'date_format',
                'time_format'
            ]);
        });
    }
};
