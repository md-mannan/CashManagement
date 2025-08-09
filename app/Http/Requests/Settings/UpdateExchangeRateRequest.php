<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExchangeRateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'exchange_rate_api_key' => ['nullable', 'string', 'max:255'],
            'exchange_rate_api_provider' => [
                'required',
                'string',
                Rule::in(['exchangerate-api.com', 'fixer.io', 'currencylayer.com'])
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'exchange_rate_api_key.max' => 'The API key must not exceed 255 characters.',
            'exchange_rate_api_provider.required' => 'Please select an API provider.',
            'exchange_rate_api_provider.in' => 'The selected API provider is invalid.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'exchange_rate_api_key' => 'API key',
            'exchange_rate_api_provider' => 'API provider',
        ];
    }
}
