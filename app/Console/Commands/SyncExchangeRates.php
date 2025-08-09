<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ExchangeRateService;
use Illuminate\Console\Command;

class SyncExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exchange-rates:sync
                            {--user-id= : Specific user ID to use for API key}
                            {--force : Force sync even if rates are fresh}
                            {--cleanup : Clean up old rates after sync}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync exchange rates from external API and store in database';

    protected $exchangeRateService;

    public function __construct(ExchangeRateService $exchangeRateService)
    {
        parent::__construct();
        $this->exchangeRateService = $exchangeRateService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting exchange rate synchronization...');

        // Get user for API key (if specified)
        $user = null;
        if ($userId = $this->option('user-id')) {
            $user = User::find($userId);
            if (!$user) {
                $this->error("User with ID {$userId} not found.");
                return 1;
            }
            $this->info("Using API key from user: {$user->name} ({$user->email})");
        } else {
            // Try to find a user with an API key
            $user = User::whereNotNull('exchange_rate_api_key')->first();
            if ($user) {
                $this->info("Using API key from user: {$user->name} ({$user->email})");
            } else {
                $this->info("No user API key found, using default configuration");
            }
        }

        // Sync rates
        $results = $this->exchangeRateService->syncAllRates($user);

        // Process results
        $successCount = 0;
        $failedCount = 0;
        $errorCount = 0;

        foreach ($results as $result) {
            switch ($result['status']) {
                case 'success':
                    $successCount++;
                    break;
                case 'failed':
                    $failedCount++;
                    break;
                case 'error':
                    $errorCount++;
                    $this->warn("Error syncing {$result['from']}->{$result['to']}: " . ($result['error'] ?? 'Unknown error'));
                    break;
            }
        }

        $totalCount = count($results);
        $this->info("Sync completed:");
        $this->info("  ✅ Success: {$successCount}/{$totalCount}");

        if ($failedCount > 0) {
            $this->warn("  ⚠️  Failed: {$failedCount}/{$totalCount}");
        }

        if ($errorCount > 0) {
            $this->error("  ❌ Errors: {$errorCount}/{$totalCount}");
        }

        // Clean up old rates if requested
        if ($this->option('cleanup')) {
            $this->info('Cleaning up old exchange rates...');
            $deletedCount = $this->exchangeRateService->clearOldRates();
            $this->info("Cleaned up {$deletedCount} old exchange rate records.");
        }

        // Show some sample rates
        $this->info('Sample current rates:');
        $samplePairs = [
            ['USD', 'EUR'],
            ['USD', 'GBP'],
            ['USD', 'KWD'],
            ['EUR', 'USD'],
            ['KWD', 'USD']
        ];

        foreach ($samplePairs as [$from, $to]) {
            try {
                $rate = $this->exchangeRateService->getExchangeRate($from, $to, $user);
                $this->info("  1 {$from} = {$rate} {$to}");
            } catch (\Exception $e) {
                $this->warn("  Failed to get {$from}->{$to}: " . $e->getMessage());
            }
        }

        return 0;
    }
}
