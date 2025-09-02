<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppearanceRequest extends FormRequest
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
            'appearance_mode' => ['required', Rule::in(['light', 'dark', 'system'])],
            'theme' => ['required', Rule::in(['neutral', 'violet', 'blue', 'green', 'orange', 'red'])],
            'timezone' => ['nullable', 'string', 'max:50', 'timezone'],
            'date_format' => ['nullable', 'string', 'max:20', Rule::in(['Y-m-d', 'd/m/Y', 'm/d/Y', 'd-m-Y', 'm-d-Y'])],
            'time_format' => ['nullable', 'string', 'max:10', Rule::in(['H:i', 'h:i A', 'h:i a'])],
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
            'appearance_mode.required' => 'Appearance mode is required.',
            'appearance_mode.in' => 'Invalid appearance mode selected.',
            'theme.required' => 'Theme is required.',
            'theme.in' => 'Invalid theme selected.',
            'timezone.timezone' => 'Please select a valid timezone.',
            'date_format.in' => 'Please select a valid date format.',
            'time_format.in' => 'Please select a valid time format.',
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
            'appearance_mode' => 'appearance mode',
            'theme' => 'theme',
            'timezone' => 'timezone',
            'date_format' => 'date format',
            'time_format' => 'time format',
        ];
    }
}
