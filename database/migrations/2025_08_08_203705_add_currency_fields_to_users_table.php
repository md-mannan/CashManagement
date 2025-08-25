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
            $table->string('primary_currency', 3)->default('BDT')->after('email');
            $table->string('secondary_currency', 3)->default('KWD')->after('primary_currency');
            $table->string('primary_symbol', 5)->default('৳')->after('secondary_currency');
            $table->string('secondary_symbol', 5)->default('د.ك')->after('primary_symbol');
            $table->decimal('exchange_rate', 10, 4)->default(1.0)->after('secondary_symbol');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'primary_currency',
                'secondary_currency',
                'primary_symbol',
                'secondary_symbol',
                'exchange_rate'
            ]);
        });
    }
};
