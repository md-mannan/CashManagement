<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && $this->route('transaction')->user_id === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
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
            'due_date' => 'nullable|date|after_or_equal:date',
            'metadata' => 'nullable|array',
            'metadata.exchange_rate' => 'nullable|numeric|min:0.01',
            'metadata.secondary_amount' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
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
            'due_date.after_or_equal' => 'Due date must be on or after the transaction date.',
            'metadata.exchange_rate.numeric' => 'Exchange rate must be a valid number.',
            'metadata.exchange_rate.min' => 'Exchange rate must be greater than 0.',
            'metadata.secondary_amount.numeric' => 'Secondary amount must be a valid number.',
            'metadata.secondary_amount.min' => 'Secondary amount must be 0 or greater.',
        ];
    }
}
