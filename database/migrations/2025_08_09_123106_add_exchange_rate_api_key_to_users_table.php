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
            $table->string('exchange_rate_api_key')->nullable()->after('time_format');
            $table->string('exchange_rate_api_provider')->default('exchangerate-api.com')->after('exchange_rate_api_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'exchange_rate_api_key',
                'exchange_rate_api_provider'
            ]);
        });
    }
};
