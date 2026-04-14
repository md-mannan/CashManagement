<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TransactionService
{
    /**
     * Calculate financial summary for a user or all users (if user is null)
     */
    public function getFinancialSummary(?User $user = null, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $baseQuery = $user ? $user->transactions() : Transaction::query();

        if ($startDate && $endDate) {
            if ($user) {
                $baseQuery->dateRange($startDate, $endDate);
            } else {
                $baseQuery->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
            }
        }

        $transactions = (clone $baseQuery)->with('relatedTransaction')->get();

        // Calculate basic transaction totals
        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type', 'expense')->sum('amount');
        
        // Calculate payable/receivable totals (excluding settlements)
        $totalReceivables = $transactions->where('type', 'receivable')
            ->whereNull('related_transaction_id') // Exclude settlement transactions
            ->sum('amount');
        $totalPayables = $transactions->where('type', 'payable')
            ->whereNull('related_transaction_id') // Exclude settlement transactions
            ->sum('amount');
        
        // Calculate settlement totals (from actual settlement rows, not `settled_amount`).
        // Use query-level `whereHas` for correctness even if relations aren't loaded in memory.
        // IMPORTANT: Some older data may store settlement rows with a different `type`
        // (e.g. "settle_payable") but they are still linked via `related_transaction_id`.
        // So we treat any transaction with `related_transaction_id` as a settlement row.
        $settlementQuery = Transaction::query()
            // Settlements are ideally linked via `related_transaction_id`, but older/bad rows can be orphaned.
            // We therefore also fall back to category types (settle_payable/settle_receivable) below.
            ->where(function ($q) {
                $q->whereNotNull('related_transaction_id')
                    ->orWhere('type', 'settlement')
                    ->orWhereHas('category', function ($c) {
                        $c->whereIn('type', ['settle_payable', 'settle_receivable']);
                    });
            })
            // Guard against bad self-linked rows (related_transaction_id == id)
            ->whereColumn('id', '!=', 'related_transaction_id');
        if ($startDate && $endDate) {
            $settlementQuery->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        }
        if ($user) {
            $settlementQuery->where('user_id', $user->id);
        }

        $receivableSettlements = (float) (clone $settlementQuery)
            ->where(function ($q) {
                $q->whereHas('relatedTransaction', function ($rel) {
                    $rel->where('type', 'receivable')->whereNull('related_transaction_id');
                })->orWhereHas('category', function ($c) {
                    $c->where('type', 'settle_receivable');
                });
            })
            ->sum('amount');

        $payableSettlements = (float) (clone $settlementQuery)
            ->where(function ($q) {
                $q->whereHas('relatedTransaction', function ($rel) {
                    $rel->where('type', 'payable')->whereNull('related_transaction_id');
                })->orWhereHas('category', function ($c) {
                    $c->where('type', 'settle_payable');
                });
            })
            ->sum('amount');
            
        $totalSettlements = $receivableSettlements + $payableSettlements;
        
        // Calculate REMAINING payable/receivable amounts (after settlements)
        $remainingPayables = $totalPayables - $payableSettlements;
        $remainingReceivables = $totalReceivables - $receivableSettlements;
        
        // Only payable settlements are expenses - receivable settlements are NOT expenses
        // Receivable settlements increase net balance directly (money returned to you)
        $totalExpensesWithPayableSettlements = $totalExpenses + $payableSettlements;
        
        // Calculate net balance with correct business logic:
        // Income + Total Payables - Payable Settlements - REMAINING Receivables + Receivable Settlements
        // Note: 
        // - REMAINING Receivables DECREASE net balance (money you've still lent out)
        // - Receivable Settlements INCREASE net balance directly (money returned to you)
        // Note: Payables are money you owe to others, not money you have available
        // Net Balance = Income - Expenses - Total Receivables + Receivable Settlements
        // Net Balance Formula: Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements
        // This matches the formula used in Ledger page for consistency
        $netBalance = $totalIncome - $totalExpenses - $totalReceivables + $totalPayables + $receivableSettlements - $payableSettlements;
        




        // Calculate original entered amounts in secondary currency
        if ($user) {
            // Single user view - use their secondary currency settings
            $secondaryAmounts = $this->calculateSecondaryAmountSums($transactions, $user);

            // IMPORTANT: keep payable/receivable secondary totals consistent with the primary logic
            // by calculating them per related transaction (parent) and its settlements.
            // This fixes cases where:
            // - some settlement rows are missing `metadata.secondary_amount`
            // - different payables use different exchange rates
            // - legacy settlement rows use different `type` values
            $secondaryCurrency = $user->secondary_currency ?? null;
            if ($secondaryCurrency) {
                $payablesSecondaryTotal = 0.0;
                $payablesSecondarySettled = 0.0;
                $receivablesSecondaryTotal = 0.0;
                $receivablesSecondarySettled = 0.0;

                $parentQuery = Transaction::query()
                    ->where('user_id', $user->id)
                    ->whereNull('related_transaction_id');

                if ($startDate && $endDate) {
                    $parentQuery->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
                }

                $payables = (clone $parentQuery)
                    ->where('type', 'payable')
                    ->where('metadata->secondary_currency', $secondaryCurrency)
                    ->with(['settlements' => function ($q) use ($startDate, $endDate) {
                        if ($startDate && $endDate) {
                            $q->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
                        }
                    }])
                    ->get();

                foreach ($payables as $p) {
                    $pMeta = is_array($p->metadata) ? $p->metadata : [];
                    $rate = (float) (($pMeta['exchange_rate'] ?? 0) ?: 0);

                    $pSecondaryTotal = (float) (($pMeta['secondary_amount'] ?? 0) ?: 0);
                    if ($pSecondaryTotal <= 0 && $rate > 0) {
                        $pSecondaryTotal = ((float) $p->amount) / $rate;
                    }
                    $payablesSecondaryTotal += $pSecondaryTotal;

                    foreach ($p->settlements as $s) {
                        $sMeta = is_array($s->metadata) ? $s->metadata : [];
                        $sSecondary = (float) (($sMeta['secondary_amount'] ?? 0) ?: 0);
                        if ($sSecondary <= 0 && $rate > 0) {
                            $sSecondary = ((float) $s->amount) / $rate;
                        }
                        $payablesSecondarySettled += $sSecondary;
                    }
                }

                // Add orphan settlement rows (not linked to a payable) but categorized as settle_payable.
                $orphanPayableSettlements = Transaction::query()
                    ->where('user_id', $user->id)
                    ->whereColumn('id', '!=', 'related_transaction_id')
                    ->whereHas('category', function ($c) {
                        $c->where('type', 'settle_payable');
                    })
                    ->whereDoesntHave('relatedTransaction')
                    ->get(['amount', 'metadata']);
                foreach ($orphanPayableSettlements as $s) {
                    $sMeta = is_array($s->metadata) ? $s->metadata : [];
                    if (($sMeta['secondary_currency'] ?? null) !== $secondaryCurrency) {
                        continue;
                    }
                    $sSecondary = (float) (($sMeta['secondary_amount'] ?? 0) ?: 0);
                    if ($sSecondary <= 0) {
                        $rate = (float) (($sMeta['exchange_rate'] ?? 0) ?: 0);
                        if ($rate > 0) {
                            $sSecondary = ((float) $s->amount) / $rate;
                        }
                    }
                    $payablesSecondarySettled += $sSecondary;
                }

                $receivables = (clone $parentQuery)
                    ->where('type', 'receivable')
                    ->where('metadata->secondary_currency', $secondaryCurrency)
                    ->with(['settlements' => function ($q) use ($startDate, $endDate) {
                        if ($startDate && $endDate) {
                            $q->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
                        }
                    }])
                    ->get();

                foreach ($receivables as $r) {
                    $rMeta = is_array($r->metadata) ? $r->metadata : [];
                    $rate = (float) (($rMeta['exchange_rate'] ?? 0) ?: 0);

                    $rSecondaryTotal = (float) (($rMeta['secondary_amount'] ?? 0) ?: 0);
                    if ($rSecondaryTotal <= 0 && $rate > 0) {
                        $rSecondaryTotal = ((float) $r->amount) / $rate;
                    }
                    $receivablesSecondaryTotal += $rSecondaryTotal;

                    foreach ($r->settlements as $s) {
                        $sMeta = is_array($s->metadata) ? $s->metadata : [];
                        $sSecondary = (float) (($sMeta['secondary_amount'] ?? 0) ?: 0);
                        if ($sSecondary <= 0 && $rate > 0) {
                            $sSecondary = ((float) $s->amount) / $rate;
                        }
                        $receivablesSecondarySettled += $sSecondary;
                    }
                }

                $orphanReceivableSettlements = Transaction::query()
                    ->where('user_id', $user->id)
                    ->whereColumn('id', '!=', 'related_transaction_id')
                    ->whereHas('category', function ($c) {
                        $c->where('type', 'settle_receivable');
                    })
                    ->whereDoesntHave('relatedTransaction')
                    ->get(['amount', 'metadata']);
                foreach ($orphanReceivableSettlements as $s) {
                    $sMeta = is_array($s->metadata) ? $s->metadata : [];
                    if (($sMeta['secondary_currency'] ?? null) !== $secondaryCurrency) {
                        continue;
                    }
                    $sSecondary = (float) (($sMeta['secondary_amount'] ?? 0) ?: 0);
                    if ($sSecondary <= 0) {
                        $rate = (float) (($sMeta['exchange_rate'] ?? 0) ?: 0);
                        if ($rate > 0) {
                            $sSecondary = ((float) $s->amount) / $rate;
                        }
                    }
                    $receivablesSecondarySettled += $sSecondary;
                }

                $secondaryAmounts['total_payables'] = $payablesSecondaryTotal;
                $secondaryAmounts['total_receivables'] = $receivablesSecondaryTotal;
                $secondaryAmounts['payable_settlements'] = $payablesSecondarySettled;
                $secondaryAmounts['receivable_settlements'] = $receivablesSecondarySettled;
                $secondaryAmounts['net_balance'] =
                    ($secondaryAmounts['total_income'] ?? 0)
                    - ($secondaryAmounts['total_expenses'] ?? 0)
                    - ($secondaryAmounts['total_receivables'] ?? 0)
                    + ($secondaryAmounts['total_payables'] ?? 0)
                    + ($secondaryAmounts['receivable_settlements'] ?? 0)
                    - ($secondaryAmounts['payable_settlements'] ?? 0);
            }
        } else {
            // System-wide view (super admin) - calculate secondary amounts for all users
            $secondaryAmounts = $this->calculateSystemSecondaryAmountSums($transactions);
        }

        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'total_expenses_with_payable_settlements' => $totalExpensesWithPayableSettlements,
            'total_receivables' => $totalReceivables,
            'total_payables' => $totalPayables,
            'remaining_receivables' => $remainingReceivables,
            'remaining_payables' => $remainingPayables,
            'total_settlements' => $totalSettlements,
            'receivable_settlements' => $receivableSettlements,
            'payable_settlements' => $payableSettlements,
            'net_balance' => $netBalance,
            'pending_receivables' => $transactions->where('type', 'receivable')
                ->whereNull('related_transaction_id')
                ->where('status', 'pending')->sum('amount'),
            'pending_payables' => $transactions->where('type', 'payable')
                ->whereNull('related_transaction_id')
                ->where('status', 'pending')->sum('amount'),
            // Add secondary currency amounts (original entered amounts)
            'secondary_amounts' => $secondaryAmounts,
        ];
    }

    /**
     * Calculate sums of original entered amounts in secondary currency for a specific user
     */
    public function calculateSecondaryAmountSums($transactions, User $user): array
    {
        $totals = [
            'total_income' => 0,
            'total_expenses' => 0,
            'total_receivables' => 0,
            'total_payables' => 0,
            'receivable_settlements' => 0,
            'payable_settlements' => 0,
        ];

        foreach ($transactions as $transaction) {
            $originalSecondaryAmount = 0;

            // Only use secondary amount if it was actually entered in secondary currency
            if ($transaction->metadata &&
                isset($transaction->metadata['secondary_currency']) &&
                isset($transaction->metadata['secondary_amount']) &&
                $transaction->metadata['secondary_currency'] === $user->secondary_currency) {

                $originalSecondaryAmount = $transaction->metadata['secondary_amount'];
            }
            // If transaction was entered in primary currency, don't convert - leave as 0
            // This ensures secondary amounts only show actual secondary currency entries

            // Add to appropriate total
            switch ($transaction->type) {
                case 'income':
                    $totals['total_income'] += $originalSecondaryAmount;
                    break;
                case 'expense':
                    $totals['total_expenses'] += $originalSecondaryAmount;
                    break;
                case 'settlement':
                    // Check if this is a receivable or payable settlement
                    if ($transaction->relatedTransaction && $transaction->relatedTransaction->type === 'receivable') {
                        // Receivable settlement - money returned to you (NOT an expense)
                        $totals['receivable_settlements'] += $originalSecondaryAmount;
                    } else {
                        // Payable settlement - money you paid (IS an expense)
                        $totals['payable_settlements'] += $originalSecondaryAmount;
                    }
                    break;
                case 'receivable':
                    $totals['total_receivables'] += $originalSecondaryAmount;
                    break;
                case 'payable':
                    $totals['total_payables'] += $originalSecondaryAmount;
                    break;
            }
        }

        // Calculate secondary currency net balance using the SAME formula as primary
        // Formula: Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements
        $totals['net_balance'] = $totals['total_income'] - $totals['total_expenses'] - $totals['total_receivables'] + $totals['total_payables'] + $totals['receivable_settlements'] - $totals['payable_settlements'];
        
        return $totals;
    }

    /**
     * Calculate sums of original entered amounts in secondary currency for system-wide view (super admin)
     */
    public function calculateSystemSecondaryAmountSums($transactions): array
    {
        $totals = [
            'total_income' => 0,
            'total_expenses' => 0,
            'total_receivables' => 0,
            'total_payables' => 0,
            'receivable_settlements' => 0,
            'payable_settlements' => 0,
        ];

        foreach ($transactions as $transaction) {
            $originalSecondaryAmount = 0;

            // For system-wide view, include all secondary amounts regardless of which user's currency
            if ($transaction->metadata &&
                isset($transaction->metadata['secondary_amount']) &&
                $transaction->metadata['secondary_amount'] > 0) {

                $originalSecondaryAmount = $transaction->metadata['secondary_amount'];
            }

            // Add to appropriate total
            switch ($transaction->type) {
                case 'income':
                    $totals['total_income'] += $originalSecondaryAmount;
                    break;
                case 'expense':
                    $totals['total_expenses'] += $originalSecondaryAmount;
                    break;
                case 'settlement':
                    // Check if this is a receivable or payable settlement
                    if ($transaction->relatedTransaction && $transaction->relatedTransaction->type === 'receivable') {
                        // Receivable settlement - money returned to you (NOT an expense)
                        $totals['receivable_settlements'] += $originalSecondaryAmount;
                    } else {
                        // Payable settlement - money you paid (IS an expense)
                        $totals['payable_settlements'] += $originalSecondaryAmount;
                    }
                    break;
                case 'receivable':
                    $totals['total_receivables'] += $originalSecondaryAmount;
                    break;
                case 'payable':
                    $totals['total_payables'] += $originalSecondaryAmount;
                    break;
            }
        }

        // Calculate secondary currency net balance using the SAME formula as primary
        // Formula: Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements
        $totals['net_balance'] = $totals['total_income'] - $totals['total_expenses'] - $totals['total_receivables'] + $totals['total_payables'] + $totals['receivable_settlements'] - $totals['payable_settlements'];
        
        return $totals;
    }

    /**
     * Get monthly chart data for dashboard - shows all months with transaction data
     */
    public function getMonthlyChartData(?User $user = null): array
    {
        $data = [
            'labels' => [],
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => [],
                    'borderColor' => 'rgb(34, 197, 94)',
                    'backgroundColor' => 'rgba(34, 197, 94, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Expense',
                    'data' => [],
                    'borderColor' => 'rgb(239, 68, 68)',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Receivable',
                    'data' => [],
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Payable',
                    'data' => [],
                    'borderColor' => 'rgb(249, 115, 22)',
                    'backgroundColor' => 'rgba(249, 115, 22, 0.8)',
                    'type' => 'bar',
                ],
                // Settlements are now included in expenses, so no separate dataset needed
                // [
                //     'label' => 'Settlements',
                //     'data' => [],
                //     'borderColor' => 'rgb(139, 92, 246)',
                //     'backgroundColor' => 'rgba(139, 92, 246, 0.8)',
                //     'type' => 'bar',
                // ],
            ],
        ];

        // Get all unique year-month combinations from transactions
        if ($user) {
            $monthlyPeriods = $user->transactions()
                ->selectRaw('YEAR(date) as year, MONTH(date) as month')
                ->groupBy('year', 'month')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get();
        } else {
            // Admin view - all transactions
            $monthlyPeriods = Transaction::selectRaw('YEAR(date) as year, MONTH(date) as month')
                ->groupBy('year', 'month')
                ->orderBy('year', 'asc')
                ->orderBy('month', 'asc')
                ->get();
        }

        // If no transactions found, return empty data
        if ($monthlyPeriods->isEmpty()) {
            return $data;
        }

        foreach ($monthlyPeriods as $period) {
            $startOfMonth = Carbon::create($period->year, $period->month, 1)->startOfMonth();
            $endOfMonth = $startOfMonth->copy()->endOfMonth();

            // Get all transactions for this month
            if ($user) {
                $transactions = $user->transactions()
                    ->with('relatedTransaction') // Eager load the relationship
                    ->whereBetween('date', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
                    ->get();
            } else {
                $transactions = Transaction::with('relatedTransaction') // Eager load the relationship
                    ->whereBetween('date', [$startOfMonth->format('Y-m-d'), $endOfMonth->format('Y-m-d')])
                    ->get();
            }

            $data['labels'][] = $startOfMonth->format('M Y');
            $data['datasets'][0]['data'][] = (float) $transactions->where('type', 'income')->sum('amount');
            
            // Chart should show ONLY actual expenses, NOT settlements (same as summary cards)
            $monthlyExpenses = $transactions->where('type', 'expense')->sum('amount');
            
            $data['datasets'][1]['data'][] = (float) $monthlyExpenses;
            $data['datasets'][2]['data'][] = (float) $transactions->where('type', 'receivable')
                ->whereNull('related_transaction_id')->sum('amount');
            $data['datasets'][3]['data'][] = (float) $transactions->where('type', 'payable')
                ->whereNull('related_transaction_id')->sum('amount');
            // Remove settlements as separate dataset since they're now included in expenses
            // $data['datasets'][4]['data'][] = (float) $transactions->where('type', 'settlement')->sum('amount');
        }

        return $data;
    }

    /**
     * Get yearly chart data for dashboard - shows all years with transaction data
     */
    public function getYearlyChartData(?User $user = null): array
    {
        $data = [
            'labels' => [],
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => [],
                    'borderColor' => 'rgb(34, 197, 94)',
                    'backgroundColor' => 'rgba(34, 197, 94, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Expense',
                    'data' => [],
                    'borderColor' => 'rgb(239, 68, 68)',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Receivable',
                    'data' => [],
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.8)',
                    'type' => 'bar',
                ],
                [
                    'label' => 'Payable',
                    'data' => [],
                    'borderColor' => 'rgb(249, 115, 22)',
                    'backgroundColor' => 'rgba(249, 115, 22, 0.8)',
                    'type' => 'bar',
                ],
            ],
        ];

        // Get all unique years from transactions
        if ($user) {
            $yearlyPeriods = $user->transactions()
                ->selectRaw('YEAR(date) as year')
                ->groupBy('year')
                ->orderBy('year', 'asc')
                ->get();
        } else {
            // Admin view - all transactions
            $yearlyPeriods = Transaction::selectRaw('YEAR(date) as year')
                ->groupBy('year')
                ->orderBy('year', 'asc')
                ->get();
        }

        // If no transactions found, return empty data
        if ($yearlyPeriods->isEmpty()) {
            return $data;
        }

        foreach ($yearlyPeriods as $period) {
            $startOfYear = Carbon::create($period->year, 1, 1)->startOfYear();
            $endOfYear = $startOfYear->copy()->endOfYear();

            // Get all transactions for this year
            if ($user) {
                $transactions = $user->transactions()
                    ->with('relatedTransaction') // Eager load the relationship
                    ->whereBetween('date', [$startOfYear->format('Y-m-d'), $endOfYear->format('Y-m-d')])
                    ->get();
            } else {
                $transactions = Transaction::with('relatedTransaction') // Eager load the relationship
                    ->whereBetween('date', [$startOfYear->format('Y-m-d'), $endOfYear->format('Y-m-d')])
                    ->get();
            }

            $data['labels'][] = $period->year;
            $data['datasets'][0]['data'][] = (float) $transactions->where('type', 'income')->sum('amount');
            
            // Chart should show ONLY actual expenses, NOT settlements (same as summary cards)
            $yearlyExpenses = $transactions->where('type', 'expense')->sum('amount');
            
            $data['datasets'][1]['data'][] = (float) $yearlyExpenses;
            $data['datasets'][2]['data'][] = (float) $transactions->where('type', 'receivable')->sum('amount');
            $data['datasets'][3]['data'][] = (float) $transactions->where('type', 'payable')->sum('amount');
        }

        return $data;
    }

    /**
     * Get category breakdown for pie chart
     */
    public function getCategoryBreakdown(?User $user = null, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        if ($user) {
            $query = $user->transactions()->with('category');
        } else {
            // Admin view - all transactions
            $query = Transaction::with('category');
        }

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        }

        $transactions = $query->get();

        // Group by transaction type first
        $typeData = [
            'income' => $transactions->where('type', 'income')->sum('amount'),
            'expense' => $transactions->where('type', 'expense')->sum('amount'),
            'receivable' => $transactions->where('type', 'receivable')->sum('amount'),
            'payable' => $transactions->where('type', 'payable')->sum('amount'),
        ];

        // Filter out zero values
        $typeData = array_filter($typeData, fn($value) => $value > 0);

        if (empty($typeData)) {
            return [
                'labels' => [],
                'datasets' => [
                    [
                        'data' => [],
                        'backgroundColor' => [],
                        'borderColor' => [],
                        'borderWidth' => 4,
                        'hoverBorderWidth' => 6,
                        'hoverOffset' => 20,
                    ],
                ],
            ];
        }

        // Define colors for each transaction type
        $colorMap = [
            'income' => [
                'background' => 'rgba(34, 197, 94, 1)',
                'border' => 'rgb(34, 197, 94)',
            ],
            'expense' => [
                'background' => 'rgba(239, 68, 68, 1)',
                'border' => 'rgb(239, 68, 68)',
            ],
            'receivable' => [
                'background' => 'rgba(59, 130, 246, 1)',
                'border' => 'rgb(59, 130, 246)',
            ],
            'payable' => [
                'background' => 'rgba(249, 115, 22, 1)',
                'border' => 'rgb(249, 115, 22)',
            ],
        ];

        // Generate colors based on actual data
        $backgroundColors = [];
        $borderColors = [];

        foreach (array_keys($typeData) as $type) {
            $backgroundColors[] = $colorMap[$type]['background'];
            $borderColors[] = $colorMap[$type]['border'];
        }

        return [
            'labels' => array_map('ucfirst', array_keys($typeData)),
            'datasets' => [
                [
                    'data' => array_values($typeData),
                    'backgroundColor' => $backgroundColors,
                    'borderColor' => $borderColors,
                    'borderWidth' => 4,
                    'hoverBorderWidth' => 6,
                    'hoverOffset' => 20,
                ],
            ],
        ];
    }

    /**
     * Get yearly category breakdown for pie chart
     */
    public function getYearlyCategoryBreakdown(?User $user = null, ?int $year = null): array
    {
        $targetYear = $year ?? Carbon::now()->year;
        $startOfYear = Carbon::create($targetYear)->startOfYear();
        $endOfYear = Carbon::create($targetYear)->endOfYear();

        return $this->getCategoryBreakdown($user, $startOfYear, $endOfYear);
    }



    /**
     * Calculate percentage change between two values
     */
    public function calculatePercentageChange(float $oldValue, float $newValue): float
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }

        return round((($newValue - $oldValue) / $oldValue) * 100, 2);
    }

    /**
     * Get transaction trends (comparison with previous period)
     */
    public function getTransactionTrends(User $user, Carbon $startDate, Carbon $endDate): array
    {
        $currentPeriod = $user->transactions()
            ->dateRange($startDate, $endDate)
            ->get();

        $periodLength = $startDate->diffInDays($endDate);
        $previousStart = $startDate->copy()->subDays($periodLength + 1);
        $previousEnd = $startDate->copy()->subDay();

        $previousPeriod = $user->transactions()
            ->dateRange($previousStart, $previousEnd)
            ->get();

        $currentSummary = [
            'income' => $currentPeriod->where('type', 'income')->sum('amount'),
            'expenses' => $currentPeriod->where('type', 'expense')->sum('amount'),
            'receivables' => $currentPeriod->where('type', 'receivable')->sum('amount'),
            'payables' => $currentPeriod->where('type', 'payable')->sum('amount'),
        ];

        $previousSummary = [
            'income' => $previousPeriod->where('type', 'income')->sum('amount'),
            'expenses' => $previousPeriod->where('type', 'expense')->sum('amount'),
            'receivables' => $previousPeriod->where('type', 'receivable')->sum('amount'),
            'payables' => $previousPeriod->where('type', 'payable')->sum('amount'),
        ];

        return [
            'current' => $currentSummary,
            'previous' => $previousSummary,
            'changes' => [
                'income' => $this->calculatePercentageChange($previousSummary['income'], $currentSummary['income']),
                'expenses' => $this->calculatePercentageChange($previousSummary['expenses'], $currentSummary['expenses']),
                'receivables' => $this->calculatePercentageChange($previousSummary['receivables'], $currentSummary['receivables']),
                'payables' => $this->calculatePercentageChange($previousSummary['payables'], $currentSummary['payables']),
            ],
        ];
    }

    /**
     * Convert amount to user's preferred currency
     */
    public function convertCurrency(float $amount, string $fromCurrency, User $user): array
    {
        $primaryCurrency = $user->primary_currency ?? 'USD';
        $secondaryCurrency = $user->secondary_currency ?? 'EUR';
        $exchangeRate = $user->exchange_rate ?? 1.0;

        $result = [
            'original' => [
                'amount' => $amount,
                'currency' => $fromCurrency,
            ],
            'primary' => [
                'amount' => $amount, // Default to same amount
                'currency' => $primaryCurrency,
            ],
            'secondary' => [
                'amount' => $amount * $exchangeRate,
                'currency' => $secondaryCurrency,
            ],
        ];

        // If the original currency is not the primary currency, convert it
        if ($fromCurrency !== $primaryCurrency) {
            // This is a simplified conversion - in a real app, you'd use a proper exchange rate API
            $result['primary']['amount'] = $amount; // You'd apply proper conversion here
        }

        return $result;
    }

    /**
     * Get system-wide financial summary (for admins)
     */
    public function getSystemFinancialSummary(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        return $this->getFinancialSummary(null, $startDate, $endDate);
    }

    /**
     * Get system-wide monthly chart data (for admins)
     */
    public function getSystemMonthlyChartData(): array
    {
        return $this->getMonthlyChartData(null);
    }

    /**
     * Get system-wide yearly chart data (for admins)
     */
    public function getSystemYearlyChartData(): array
    {
        return $this->getYearlyChartData(null);
    }

    /**
     * Get system-wide category breakdown (for admins)
     */
    public function getSystemCategoryBreakdown(?Carbon $startDate = null): array
    {
        return $this->getCategoryBreakdown(null, $startDate);
    }

    /**
     * Get system-wide yearly category breakdown (for admins)
     */
    public function getSystemYearlyCategoryBreakdown(?int $year = null): array
    {
        return $this->getYearlyCategoryBreakdown(null, $year);
    }

    /**
     * Get system-wide upcoming transactions (for admins)
     */
    public function getSystemUpcomingTransactions(int $days = 30): Collection
    {
        return $this->getUpcomingTransactions(null, $days);
    }
}
