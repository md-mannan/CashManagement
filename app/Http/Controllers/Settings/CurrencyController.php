<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/currency');
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'primary_currency' => ['required', 'string', 'max:3'],
            'secondary_currency' => ['required', 'string', 'max:3'],
            'primary_symbol' => ['required', 'string', 'max:5'],
            'secondary_symbol' => ['required', 'string', 'max:5'],
            'exchange_rate' => ['required', 'numeric', 'min:0'],
        ]);

        // Update user's currency preferences
        $request->user()->update([
            'primary_currency' => $validated['primary_currency'],
            'secondary_currency' => $validated['secondary_currency'],
            'primary_symbol' => $validated['primary_symbol'],
            'secondary_symbol' => $validated['secondary_symbol'],
            'exchange_rate' => $validated['exchange_rate'],
        ]);

        return back()->with('success', 'Currency settings updated successfully');
    }
}
