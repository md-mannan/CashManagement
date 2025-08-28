<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transaction_types', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // payable, receivable, settlement
            $table->string('direction'); // incoming, outgoing
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transaction_types');
    }
};
