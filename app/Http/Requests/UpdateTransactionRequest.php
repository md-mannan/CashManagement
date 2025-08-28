<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\FinancialConstraintService;
use Illuminate\Validation\Validator;

class UpdateTransactionRequest extends FormRequest
{
    protected FinancialConstraintService $financialConstraintService;

    public function __construct(FinancialConstraintService $financialConstraintService)
    {
        $this->financialConstraintService = $financialConstraintService;
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && $this->route('transaction')->user_id === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'category_id' => 'nullable|exists:categories,id',
            'category' => 'required_without:category_id|string|max:255',
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'type' => 'required|in:income,expense,receivable,payable',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3',
            'source' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:pending,completed,cancelled',

            'metadata' => 'nullable|array',
            'metadata.exchange_rate' => 'nullable|numeric|min:0.01',
            'metadata.secondary_amount' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $this->validateFinancialConstraints($validator);
        });
    }

    /**
     * Validate financial constraints based on transaction type
     */
    protected function validateFinancialConstraints(Validator $validator): void
    {
        $type = $this->input('type');
        $amount = (float) $this->input('amount');
        $user = auth()->user();
        $originalTransaction = $this->route('transaction');

        if (!$user) {
            return;
        }

        // Only check constraints if the type or amount has changed
        if ($type !== $originalTransaction->type || $amount !== $originalTransaction->amount) {
            // Check financial constraints for receivable and payable transactions
            if ($type === 'receivable') {
                $constraint = $this->financialConstraintService->canCreateReceivable($user, $amount);
                
                if (!$constraint['can_create']) {
                    $validator->errors()->add('amount', $constraint['message']);
                    $validator->errors()->add('financial_constraint', 'Insufficient net balance to create receivable');
                }
            }

            if ($type === 'payable') {
                $constraint = $this->financialConstraintService->canCreatePayable($user, $amount);
                
                if (!$constraint['can_create']) {
                    $validator->errors()->add('amount', $constraint['message']);
                    $validator->errors()->add('financial_constraint', 'Insufficient net balance to create payable');
                }
            }
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid.',
            'date.required' => 'Transaction date is required.',
            'description.required' => 'Transaction description is required.',
            'type.required' => 'Transaction type is required.',
            'type.in' => 'Transaction type must be income, expense, receivable, or payable.',
            'amount.required' => 'Transaction amount is required.',
            'amount.numeric' => 'Transaction amount must be a valid number.',
            'amount.min' => 'Transaction amount must be greater than 0.',
            'currency.size' => 'Currency code must be 3 characters.',

            'metadata.exchange_rate.numeric' => 'Exchange rate must be a valid number.',
            'metadata.exchange_rate.min' => 'Exchange rate must be greater than 0.',
            'metadata.secondary_amount.numeric' => 'Secondary amount must be a valid number.',
            'metadata.secondary_amount.min' => 'Secondary amount must be 0 or greater.',
        ];
    }
}
