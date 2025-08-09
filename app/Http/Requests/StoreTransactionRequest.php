<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => 'required|string|max:255',
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
            'category.required' => 'Please select a category.',
            'date.required' => 'Transaction date is required.',
            'description.required' => 'Transaction description is required.',
            'type.required' => 'Transaction type is required.',
            'type.in' => 'Transaction type must be income, expense, receivable, or payable.',
            'amount.required' => 'Transaction amount is required.',
            'amount.numeric' => 'Transaction amount must be a number.',
            'amount.min' => 'Transaction amount must be greater than 0.',
            'currency.size' => 'Currency code must be 3 characters.',
            'due_date.after_or_equal' => 'Due date must be on or after the transaction date.',
        ];
    }
}
