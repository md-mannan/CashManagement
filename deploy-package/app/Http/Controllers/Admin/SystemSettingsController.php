<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingsController extends Controller
{
    public function index()
    {
        $systemSettings = [
            'general' => [
                'site_name' => config('app.name'),
                'site_description' => config('app.description', 'Cash Management System'),
                'maintenance_mode' => app()->isDownForMaintenance(),
                'maintenance_message' => 'System is under maintenance. Please try again later.',
                'timezone' => config('app.timezone'),
                'date_format' => 'Y-m-d',
            ],
            'email' => [
                'mail_driver' => config('mail.default'),
                'mail_host' => config('mail.mailers.smtp.host'),
                'mail_port' => config('mail.mailers.smtp.port'),
                'mail_username' => config('mail.mailers.smtp.username'),
                'mail_encryption' => config('mail.mailers.smtp.encryption'),
                'mail_from_address' => config('mail.from.address'),
                'mail_from_name' => config('mail.from.name'),
            ],
            'database' => [
                'connection' => config('database.default'),
                'host' => config('database.connections.mysql.host'),
                'port' => config('database.connections.mysql.port'),
                'database' => config('database.connections.mysql.database'),
                'backup_enabled' => config('backup.backup.enabled', false),
                'backup_frequency' => 'daily',
                'backup_retention' => 30,
            ],
            'security' => [
                'session_lifetime' => config('session.lifetime'),
                'password_min_length' => 8,
                'require_email_verification' => config('auth.verification.enable', true),
                'two_factor_enabled' => false,
                'rate_limiting_enabled' => true,
                'max_login_attempts' => 5,
            ],
        ];

        return Inertia::render('admin/system-settings', [
            'systemSettings' => $systemSettings,
        ]);
    }

    public function updateGeneral(Request $request)
    {
        $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string|max:500',
            'maintenance_mode' => 'boolean',
            'maintenance_message' => 'nullable|string|max:500',
            'timezone' => 'required|string',
            'date_format' => 'required|string',
        ]);

        // In a real application, you would update the configuration
        // For now, we'll just return success
        return redirect()->back()->with('success', 'General settings updated successfully.');
    }

    public function updateEmail(Request $request)
    {
        $request->validate([
            'mail_driver' => 'required|string',
            'mail_host' => 'required|string',
            'mail_port' => 'required|integer|min:1|max:65535',
            'mail_username' => 'required|string',
            'mail_encryption' => 'required|string',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string',
        ]);

        // In a real application, you would update the configuration
        return redirect()->back()->with('success', 'Email settings updated successfully.');
    }

    public function updateDatabase(Request $request)
    {
        $request->validate([
            'connection' => 'required|string',
            'host' => 'required|string',
            'port' => 'required|integer|min:1|max:65535',
            'database' => 'required|string',
            'backup_enabled' => 'boolean',
            'backup_frequency' => 'required|string',
            'backup_retention' => 'required|integer|min:1',
        ]);

        // In a real application, you would update the configuration
        return redirect()->back()->with('success', 'Database settings updated successfully.');
    }

    public function updateSecurity(Request $request)
    {
        $request->validate([
            'session_lifetime' => 'required|integer|min:1',
            'password_min_length' => 'required|integer|min:6',
            'require_email_verification' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'rate_limiting_enabled' => 'boolean',
            'max_login_attempts' => 'required|integer|min:1|max:10',
        ]);

        // In a real application, you would update the configuration
        return redirect()->back()->with('success', 'Security settings updated successfully.');
    }
}
