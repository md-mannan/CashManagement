<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    private const CACHE_KEY_PREFIX = 'settings.';

    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever(self::CACHE_KEY_PREFIX.$key, function () use ($key, $default) {
            return Setting::query()->where('key', $key)->value('value') ?? $default;
        });
    }

    public function set(string $key, mixed $value): void
    {
        Setting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => is_scalar($value) || $value === null ? (string) $value : json_encode($value)]
        );

        Cache::forget(self::CACHE_KEY_PREFIX.$key);
    }

    public function forget(string $key): void
    {
        Setting::query()->where('key', $key)->delete();
        Cache::forget(self::CACHE_KEY_PREFIX.$key);
    }
}

