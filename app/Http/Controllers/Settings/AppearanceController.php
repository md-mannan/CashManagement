<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateAppearanceRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AppearanceController extends Controller
{
    /**
     * Show the appearance settings page.
     */
    public function edit()
    {
        return Inertia::render('settings/appearance', [
            'user_preferences' => [
                'appearance_mode' => auth()->user()->appearance_mode ?? 'system',
                'theme' => auth()->user()->theme ?? 'neutral',
                'timezone' => auth()->user()->timezone ?? 'UTC',
                'date_format' => auth()->user()->date_format ?? 'd/m/Y',
                'time_format' => auth()->user()->time_format ?? 'H:i',
            ]
        ]);
    }

    /**
     * Update the appearance settings.
     */
    public function update(UpdateAppearanceRequest $request)
    {
        $validated = $request->validated();

        // Set defaults for nullable fields
        $validated['timezone'] = $validated['timezone'] ?? 'UTC';
        $validated['date_format'] = $validated['date_format'] ?? 'd/m/Y';
        $validated['time_format'] = $validated['time_format'] ?? 'H:i';

        // Update user's appearance preferences
        $request->user()->update($validated);

        return back()->with('success', 'Appearance settings updated successfully');
    }

    /**
     * Update only the appearance mode (for quick toggle).
     */
    public function updateMode(Request $request)
    {
        $validated = $request->validate([
            'appearance_mode' => ['required', Rule::in(['light', 'dark', 'system'])],
        ]);

        $request->user()->update([
            'appearance_mode' => $validated['appearance_mode'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appearance mode updated successfully',
            'appearance_mode' => $validated['appearance_mode'],
        ]);
    }

    /**
     * Update only the theme (for quick theme switching).
     */
    public function updateTheme(Request $request)
    {
        $validated = $request->validate([
            'theme' => ['required', Rule::in(['neutral', 'violet', 'blue', 'green', 'orange', 'red'])],
        ]);

        $request->user()->update([
            'theme' => $validated['theme'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Theme updated successfully',
            'theme' => $validated['theme'],
        ]);
    }
}
