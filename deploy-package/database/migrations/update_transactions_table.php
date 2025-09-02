<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Add transaction_type_id if it doesn't exist (initially nullable)
            if (!Schema::hasColumn('transactions', 'transaction_type_id')) {
                $table->foreignId('transaction_type_id')->nullable()->constrained();
            }
            
            // Add related_transaction_id if it doesn't exist
            if (!Schema::hasColumn('transactions', 'related_transaction_id')) {
                $table->foreignId('related_transaction_id')->nullable()->constrained('transactions');
            }
            
            // Update status column if it exists, otherwise create it
            if (Schema::hasColumn('transactions', 'status')) {
                // Drop the existing status column and recreate it
                $table->dropColumn('status');
            }
            $table->enum('status', ['pending', 'partial', 'completed', 'cancelled'])->default('pending');
            
            // Add settled_amount if it doesn't exist
            if (!Schema::hasColumn('transactions', 'settled_amount')) {
                $table->decimal('settled_amount', 15, 2)->default(0);
            }
            
            // Add settled_at if it doesn't exist
            if (!Schema::hasColumn('transactions', 'settled_at')) {
                $table->timestamp('settled_at')->nullable();
            }
        });

        // Update existing transactions to have the correct transaction_type_id
        $this->updateExistingTransactionTypes();
    }

    private function updateExistingTransactionTypes()
    {
        // Get the transaction types
        $incomeTypeId = DB::table('transaction_types')->where('name', 'income')->value('id');
        $expenseTypeId = DB::table('transaction_types')->where('name', 'expense')->value('id');
        $receivableTypeId = DB::table('transaction_types')->where('name', 'receivable')->value('id');
        $payableTypeId = DB::table('transaction_types')->where('name', 'payable')->value('id');

        // Update existing transactions based on their type
        if ($incomeTypeId) {
            DB::table('transactions')
                ->where('type', 'income')
                ->whereNull('transaction_type_id')
                ->update(['transaction_type_id' => $incomeTypeId]);
        }

        if ($expenseTypeId) {
            DB::table('transactions')
                ->where('type', 'expense')
                ->whereNull('transaction_type_id')
                ->update(['transaction_type_id' => $expenseTypeId]);
        }

        if ($receivableTypeId) {
            DB::table('transactions')
                ->where('type', 'receivable')
                ->whereNull('transaction_type_id')
                ->update(['transaction_type_id' => $receivableTypeId]);
        }

        if ($payableTypeId) {
            DB::table('transactions')
                ->where('type', 'payable')
                ->whereNull('transaction_type_id')
                ->update(['transaction_type_id' => $payableTypeId]);
        }

        // Now make transaction_type_id required
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('transaction_type_id')->nullable(false)->change();
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['transaction_type_id']);
            $table->dropForeign(['related_transaction_id']);
            $table->dropColumn(['transaction_type_id', 'related_transaction_id', 'status', 'settled_amount', 'settled_at']);
        });
    }
};
