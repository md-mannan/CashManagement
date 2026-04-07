<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SettingService;
use App\Services\SetupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    public function __construct(
        private readonly SetupService $setupService,
        private readonly SettingService $settingService,
    ) {
    }

    public function index(Request $request): Response|RedirectResponse
    {
        if ($this->setupService->isCompleted()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('setup/index', [
            'defaults' => [
                'app_name' => config('app.name'),
                'primary_currency' => 'BDT',
                'primary_symbol' => '৳',
                'secondary_currency' => 'KWD',
                'secondary_symbol' => 'د.ك',
                'db_host' => env('DB_HOST', '127.0.0.1'),
                'db_port' => env('DB_PORT', '3306'),
                'db_database' => env('DB_DATABASE', ''),
                'db_username' => env('DB_USERNAME', ''),
                'exchange_api_base_url' => '',
            ],
        ]);
    }

    public function testDb(Request $request): JsonResponse
    {
        $data = $request->validate([
            'db_host' => ['required', 'string'],
            'db_port' => ['required', 'string'],
            'db_database' => ['required', 'string'],
            'db_username' => ['required', 'string'],
            'db_password' => ['nullable', 'string'],
        ]);

        $result = $this->setupService->validateDbConnection([
            'host' => $data['db_host'],
            'port' => $data['db_port'],
            'database' => $data['db_database'],
            'username' => $data['db_username'],
            'password' => $data['db_password'] ?? '',
        ]);

        return response()->json($result, $result['ok'] ? 200 : 422);
    }

    public function store(Request $request): RedirectResponse
    {
        if ($this->setupService->isCompleted()) {
            return redirect()->route('dashboard');
        }

        $data = $request->validate([
            'app_name' => ['required', 'string', 'max:120'],
            'logo' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:2048'],

            'primary_currency' => ['required', 'string', 'max:8'],
            'primary_symbol' => ['required', 'string', 'max:8'],
            'secondary_currency' => ['required', 'string', 'max:8'],
            'secondary_symbol' => ['required', 'string', 'max:8'],

            'exchange_api_base_url' => ['required', 'string', 'max:255'],
            'exchange_api_key' => ['required', 'string', 'max:255'],

            'db_host' => ['required', 'string'],
            'db_port' => ['required', 'string'],
            'db_database' => ['required', 'string'],
            'db_username' => ['required', 'string'],
            'db_password' => ['nullable', 'string'],

            'super_admin_name' => ['required', 'string', 'max:255'],
            'super_admin_email' => ['required', 'string', 'email', 'max:255'],
            'super_admin_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Best-effort DB test before writing env / migrating
        $dbTest = $this->setupService->validateDbConnection([
            'host' => $data['db_host'],
            'port' => $data['db_port'],
            'database' => $data['db_database'],
            'username' => $data['db_username'],
            'password' => $data['db_password'] ?? '',
        ]);
        if (!$dbTest['ok']) {
            return back()->withErrors(['db' => $dbTest['message'] ?? 'Database connection failed'])->withInput();
        }

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('branding', 'public');
        }

        // Persist settings
        $this->settingService->set('app_name', $data['app_name']);
        $this->settingService->set('logo_path', $logoPath);
        $this->settingService->set('primary_currency', $data['primary_currency']);
        $this->settingService->set('primary_symbol', $data['primary_symbol']);
        $this->settingService->set('secondary_currency', $data['secondary_currency']);
        $this->settingService->set('secondary_symbol', $data['secondary_symbol']);
        $this->settingService->set('exchange_api_base_url', $data['exchange_api_base_url']);
        $this->settingService->set('exchange_api_key', $data['exchange_api_key']);

        // Write env (APP_NAME, DB_*, exchange API keys). Use quotes where needed.
        $this->setupService->writeEnv([
            'APP_NAME' => $data['app_name'],
            'DB_HOST' => $data['db_host'],
            'DB_PORT' => $data['db_port'],
            'DB_DATABASE' => $data['db_database'],
            'DB_USERNAME' => $data['db_username'],
            'DB_PASSWORD' => $data['db_password'] ?? '',
            'EXCHANGE_API_BASE_URL' => $data['exchange_api_base_url'],
            'EXCHANGE_API_KEY' => $data['exchange_api_key'],
        ]);

        // Create super admin (idempotent by email)
        $user = User::query()->firstOrCreate(
            ['email' => $data['super_admin_email']],
            [
                'name' => $data['super_admin_name'],
                'password' => Hash::make($data['super_admin_password']),
                'role' => 'super_admin',
                'permissions' => [],
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
        if ($user->role !== 'super_admin') {
            $user->forceFill(['role' => 'super_admin'])->save();
        }

        // Sync initial currency preferences to the created super admin user
        $user->forceFill([
            'primary_currency' => $data['primary_currency'],
            'secondary_currency' => $data['secondary_currency'],
            'primary_symbol' => $data['primary_symbol'],
            'secondary_symbol' => $data['secondary_symbol'],
        ])->save();

        $this->setupService->markCompleted($user->id);

        Auth::login($user);

        return redirect()->route('dashboard')->with('success', 'Setup completed successfully.');
    }
}

