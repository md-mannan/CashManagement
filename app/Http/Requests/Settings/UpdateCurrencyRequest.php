<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCurrencyRequest extends FormRequest
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
        $supportedCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BDT',
            'PKR', 'KWD', 'AED', 'SAR', 'QAR', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP',
            'SGD', 'HKD', 'KRW', 'BRL', 'MXN', 'RUB', 'ZAR', 'SEK', 'NOK', 'DKK'
        ];

        return [
            'primary_currency' => ['required', 'string', 'size:3', 'in:' . implode(',', $supportedCurrencies)],
            'secondary_currency' => ['required', 'string', 'size:3', 'in:' . implode(',', $supportedCurrencies), 'different:primary_currency'],
            'primary_symbol' => ['required', 'string', 'max:5'],
            'secondary_symbol' => ['required', 'string', 'max:5'],
            // exchange_rate will be automatically fetched from the service
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
            'primary_currency.required' => 'Primary currency is required.',
            'primary_currency.in' => 'The selected primary currency is not supported.',
            'secondary_currency.required' => 'Secondary currency is required.',
            'secondary_currency.in' => 'The selected secondary currency is not supported.',
            'secondary_currency.different' => 'Secondary currency must be different from primary currency.',
            'primary_symbol.required' => 'Primary currency symbol is required.',
            'secondary_symbol.required' => 'Secondary currency symbol is required.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'primary_currency' => 'primary currency',
            'secondary_currency' => 'secondary currency',
            'primary_symbol' => 'primary currency symbol',
            'secondary_symbol' => 'secondary currency symbol',
        ];
    }
}
