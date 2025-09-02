<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static string detectEnvironment()
 * @method static string getEnvironmentType()
 * @method static array getDetectionDetails()
 * @method static array getConfigurationRecommendations()
 * @method static void applyDynamicConfiguration()
 *
 * @see \App\Services\EnvironmentDetectionService
 */
class EnvironmentDetector extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'environment.detector';
    }
}
