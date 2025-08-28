<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionType;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SettlementService
{
    protected FinancialConstraintService $financialConstraintService;

    public function __construct(FinancialConstraintService $financialConstraintService)
    {
        $this->financialConstraintService = $financialConstraintService;
    }

    public function createSettlement(Transaction $payableReceivable, array $data)
    {
        return DB::transaction(function () use ($payableReceivable, $data) {
            // Check financial constraints before creating settlement
            $this->validateSettlementConstraints($payableReceivable, $data);
            
            // Use the category from the form data
            $settlementCategory = Category::where('type', $data['category'])->first();
            
            // If no specific settlement category exists, use the original category
            if (!$settlementCategory) {
                $settlementCategory = $payableReceivable->category;
            }

            // Create settlement transaction
            $settlement = Transaction::create([
                'user_id' => $payableReceivable->user_id,
                'category_id' => $settlementCategory->id,
                'transaction_type_id' => TransactionType::where('name', 'settlement')->first()->id,
                'related_transaction_id' => $payableReceivable->id,
                'description' => $data['description'],
                'type' => 'settlement',
                'amount' => $data['amount'],
                'currency' => $payableReceivable->currency,
                'source' => $payableReceivable->source,
                'notes' => 'Settlement transaction for ' . $payableReceivable->type,
                'status' => 'completed',
                'date' => $data['date'],
                'metadata' => $this->prepareSettlementMetadata($payableReceivable, $data),
            ]);

            // Update payable/receivable status
            $newSettledAmount = $payableReceivable->settled_amount + $data['amount'];
            $payableReceivable->update([
                'settled_amount' => $newSettledAmount,
                'status' => $this->calculateStatus($payableReceivable->amount, $newSettledAmount),
                'settled_at' => $newSettledAmount >= $payableReceivable->amount ? now() : null,
            ]);

            return $settlement;
        });
    }

    /**
     * Validate financial constraints before allowing settlement
     */
    protected function validateSettlementConstraints(Transaction $payableReceivable, array $data): void
    {
        $user = $payableReceivable->user;
        $settlementAmount = (float) $data['amount'];

        // For payable settlements, check if user has sufficient net balance
        if ($payableReceivable->type === 'payable') {
            $constraint = $this->financialConstraintService->canSettlePayable($user, $settlementAmount);
            
            if (!$constraint['can_settle']) {
                throw ValidationException::withMessages([
                    'amount' => $constraint['message'],
                    'financial_constraint' => 'Cannot settle payable: Insufficient net balance'
                ]);
            }
        }

        // For receivable settlements, no financial constraint check needed
        // (receiving money back doesn't require having money available)
    }

    private function calculateStatus($totalAmount, $settledAmount)
    {
        if ($settledAmount == 0) return 'pending';
        if ($settledAmount < $totalAmount) return 'partial';
        if ($settledAmount >= $totalAmount) return 'completed';
        return 'pending';
    }

    /**
     * Prepare metadata for settlement transactions
     */
    private function prepareSettlementMetadata(Transaction $payableReceivable, array $data): ?array
    {
        $metadata = [];
        
        // Always include secondary currency info if the original transaction has it
        if (isset($payableReceivable->metadata['secondary_currency'])) {
            $metadata['secondary_currency'] = $payableReceivable->metadata['secondary_currency'];
            $metadata['primary_currency'] = $payableReceivable->metadata['primary_currency'] ?? $payableReceivable->currency;
            $metadata['primary_symbol'] = $payableReceivable->metadata['primary_symbol'] ?? null;
        }
        
        // Include exchange rate (from form data or original transaction)
        if (isset($data['exchange_rate']) && $data['exchange_rate'] > 0) {
            $metadata['exchange_rate'] = $data['exchange_rate'];
        } elseif (isset($payableReceivable->metadata['exchange_rate'])) {
            $metadata['exchange_rate'] = $payableReceivable->metadata['exchange_rate'];
        }
        
        // Include secondary amount if provided
        if (isset($data['secondary_amount']) && $data['secondary_amount'] > 0) {
            $metadata['secondary_amount'] = $data['secondary_amount'];
        }
        
        // Only return metadata if we have meaningful data
        return !empty($metadata) ? $metadata : null;
    }
}
