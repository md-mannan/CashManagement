<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\TransactionType;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Services\SettlementService;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        

        // Admins and super admins can view all transactions
        if ($user->isAdmin()) {
            $query = Transaction::with(['category', 'user'])
                ->orderBy('date', 'asc')
                ->orderBy('created_at', 'asc');
        } else {
            $query = Transaction::with('category')
                ->forUser($user->id)
                ->orderBy('date', 'asc')
                ->orderBy('created_at', 'asc');
        }

        // Apply filters
        if ($request->filled('type') && $request->type !== 'all') {
            $query->ofType($request->type);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('source', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // SECURITY: Only allow users to view their own transactions
        // Admins cannot access other users' data without explicit authorization
        $query->where('user_id', $user->id);
        
        // Use TransactionService for consistent summary calculation
        $summary = $this->transactionService->getFinancialSummary($user);
      

        // Get all transactions for the table
        $transactions = $query->with('relatedTransaction')->get();

        return Inertia::render('transaction', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'search', 'category_id']),
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /**
     * Display the ledger view.
     */
    public function ledger(Request $request)
    {
        $user = Auth::user();
        


        // Admins and super admins can view all transactions
        if ($user->isAdmin()) {
            $query = Transaction::with(['category', 'user'])
                ->orderBy('date', 'asc');
        } else {
            $query = Transaction::with('category')
                ->forUser($user->id)
                ->orderBy('date', 'asc');
        }

        // Apply filters similar to index
        if ($request->filled('type') && $request->type !== 'all') {
            $query->ofType($request->type);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('source', 'like', '%' . $request->search . '%');
            });
        }

        // SECURITY: Only allow users to view their own transactions
        // Admins cannot access other users' data without explicit authorization
        $query->where('user_id', $user->id);

        $transactions = $query->with('relatedTransaction')->get();

        // Calculate summary data with correct settlement handling
        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type', 'expense')->sum('amount');
        
        // Separate receivable and payable settlements
        $receivableSettlements = 0;
        $payableSettlements = 0;
        
        // Get settlement transactions based on category names (not just type)
        $settlementTransactions = $transactions->filter(function ($transaction) {
            $categoryName = strtolower($transaction->category->name);
            return str_contains($categoryName, 'return') || str_contains($categoryName, 'pay') || str_contains($categoryName, 'settle');
        });
        
        foreach ($settlementTransactions as $settlement) {
            $categoryName = strtolower($settlement->category->name);
            
            if (str_contains($categoryName, 'return')) {
                // Receivable settlement (getting money back)
                $receivableSettlements += $settlement->amount;
            } elseif (str_contains($categoryName, 'pay')) {
                // Payable settlement (paying back borrowed money)
                $payableSettlements += $settlement->amount;
            }
        }
            
        $totalSettlements = $receivableSettlements + $payableSettlements;
        
        $totalReceivables = $transactions->where('type', 'receivable')->sum('amount');
        $totalPayables = $transactions->where('type', 'payable')->sum('amount');
        
        // Calculate REMAINING payable/receivable amounts (after settlements)
        $remainingPayables = $totalPayables - $payableSettlements;
        $remainingReceivables = $totalReceivables - $receivableSettlements;
        
        // Only payable settlements are expenses - receivable settlements increase net balance directly
        $totalExpensesWithPayableSettlements = $totalExpenses + $payableSettlements;
        
        // Calculate net balance before using it in summary
        // Formula: Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements (same as index method)
        $calculatedNetBalance = $totalIncome - $totalExpenses - $totalReceivables + $totalPayables + $receivableSettlements - $payableSettlements;
        
        // Calculate secondary currency totals from metadata
        $secondaryCurrencyTotals = [
            'income' => 0,
            'expenses' => 0,
            'receivables' => 0,
            'payables' => 0,
            'settlements' => 0,
        ];
        
        // Sum secondary currency amounts for each transaction type
        foreach ($transactions as $transaction) {
            if (isset($transaction->metadata['secondary_amount']) && $transaction->metadata['secondary_amount'] > 0) {
                $amount = (float) $transaction->metadata['secondary_amount'];
                switch ($transaction->type) {
                    case 'income':
                        $secondaryCurrencyTotals['income'] += $amount;
                        break;
                    case 'expense':
                        $secondaryCurrencyTotals['expenses'] += $amount;
                        break;
                    case 'receivable':
                        $secondaryCurrencyTotals['receivables'] += $amount;
                        break;
                    case 'payable':
                        $secondaryCurrencyTotals['payables'] += $amount;
                        break;
                    case 'settlement':
                        $secondaryCurrencyTotals['settlements'] += $amount;
                        break;
                }
            }
        }
        
        // Calculate secondary currency settlements
        $secondaryReceivableSettlements = 0;
        $secondaryPayableSettlements = 0;
        
        foreach ($settlementTransactions as $settlement) {
            if (isset($settlement->metadata['secondary_amount']) && $settlement->metadata['secondary_amount'] > 0) {
                $amount = (float) $settlement->metadata['secondary_amount'];
                $categoryName = strtolower($settlement->category->name);
                
                if (str_contains($categoryName, 'return')) {
                    $secondaryReceivableSettlements += $amount;
                } elseif (str_contains($categoryName, 'pay')) {
                    $secondaryPayableSettlements += $amount;
                }
            }
        }
        
        // Calculate remaining secondary currency amounts
        $secondaryRemainingReceivables = $secondaryCurrencyTotals['receivables'] - $secondaryReceivableSettlements;
        $secondaryRemainingPayables = $secondaryCurrencyTotals['payables'] - $secondaryPayableSettlements;
        
        // Calculate secondary currency net balance using the SAME formula as primary
        // Formula: Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements
        $secondaryNetBalance = $secondaryCurrencyTotals['income'] - $secondaryCurrencyTotals['expenses'] - $secondaryCurrencyTotals['receivables'] + $secondaryCurrencyTotals['payables'] + $secondaryReceivableSettlements - $secondaryPayableSettlements;
        
        // Add the calculated net balance to secondary currency totals
        $secondaryCurrencyTotals['net_balance'] = $secondaryNetBalance;
        
        $summary = [
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
            'net_balance' => $calculatedNetBalance,
            'secondary_currency_totals' => $secondaryCurrencyTotals,
            'secondary_net_balance' => $secondaryNetBalance,
            'secondary_remaining_receivables' => $secondaryRemainingReceivables,
            'secondary_remaining_payables' => $secondaryRemainingPayables,
            'secondary_receivable_settlements' => $secondaryReceivableSettlements,
            'secondary_payable_settlements' => $secondaryPayableSettlements,
        ];

    

        return Inertia::render('ledger', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'search', 'category_id']),
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::active()->get();

        return Inertia::render('add-transaction', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        // Find or create category by name and type
        $category = Category::where('name', $request->category)
            ->where('type', $request->type)
            ->first();
        
        // If not found, try to find by slug
        if (!$category) {
            $slug = \Str::slug($request->category);
            $category = Category::where('slug', $slug)->first();
        }
        
        // If still not found, create new category
        if (!$category) {
            $category = Category::create([
                'name' => $request->category,
                'type' => $request->type,
                'slug' => $slug,
                'color' => $this->getDefaultCategoryColor($request->type),
                'is_active' => true,
            ]);
        }

        // Get the transaction type ID based on the type
        $transactionType = TransactionType::where('name', $request->type)->first();
        if (!$transactionType) {
            return back()->withErrors(['type' => 'Invalid transaction type']);
        }

        $transaction = Transaction::create([
            'user_id' => Auth::id(),
            'category_id' => $category->id,
            'transaction_type_id' => $transactionType->id,
            'date' => $request->date,
            'description' => $request->description,
            'type' => $request->type,
            'amount' => $request->amount,
            'currency' => $request->currency ?? Auth::user()->primary_currency,
            'source' => $request->source,
            'notes' => $request->notes,
            'status' => $request->status ?? 'completed',
            'metadata' => $request->metadata,
        ]);

        // Create notification for transaction creation
        $this->createTransactionNotification($transaction, 'created');

        // Notify admins about the transaction creation (exclude current user if they're an admin)
        $excludeUserId = in_array(Auth::user()->role, ['admin', 'super_admin']) ? Auth::id() : null;
        AdminNotificationService::notifyTransactionAction(
            'created',
            Auth::user()->name,
            $transaction->type,
            $transaction->amount,
            $transaction->currency,
            $excludeUserId
        );

        // Redirect to transaction list with success message
        return to_route('transaction')->with('success', 'Transaction created successfully.');
    }

    /**
     * Get default color for category type
     */
    private function getDefaultCategoryColor(string $type): string
    {
        return match($type) {
            'income' => '#10B981', // Green
            'expense' => '#EF4444', // Red
            'receivable' => '#3B82F6', // Blue
            'payable' => '#F59E0B', // Orange
            default => '#6B7280', // Gray
        };
    }

    /**
     * Create notification for transaction actions
     */
    private function createTransactionNotification(Transaction $transaction, string $action): void
    {
        $user = Auth::user();
        $primarySymbol = $user->primary_symbol ?? '$';
        $amount = number_format($transaction->amount, 2);

        $actionText = $action === 'created' ? 'added' : 'updated';
        $typeText = ucfirst($transaction->type);

        $title = "{$typeText} Transaction " . ucfirst($actionText);
        $message = "Your {$transaction->type} of {$primarySymbol}{$amount} has been {$actionText} successfully";

        $icon = match ($transaction->type) {
            'income' => 'TrendingUp',
            'expense' => 'TrendingDown',
            'receivable' => 'ArrowUpRight',
            'payable' => 'ArrowDownLeft',
            default => 'DollarSign',
        };

        $color = match ($transaction->type) {
            'income' => 'green',
            'expense' => 'red',
            'receivable' => 'blue',
            'payable' => 'orange',
            default => 'blue',
        };

        $notification = Notification::createForUser(
            $user->id,
            'success',
            $title,
            $message,
            [
                'icon' => $icon,
                'color' => $color,
                'data' => [
                    'transaction_id' => $transaction->id,
                    'action' => $action,
                    'type' => $transaction->type,
                    'amount' => $transaction->amount,
                ],
                'is_important' => false,
            ]
        );

        // Auto-mark transaction notifications as read after 30 seconds to reduce notification clutter
        dispatch(function() use ($notification) {
            $notification->markAsRead();
        })->delay(now()->addSeconds(30));
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        $user = Auth::user();



        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('dashboard')->with('error', 'Please log in to access transactions.');
        }

        // Admins and super admins can view any transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            // Instead of abort(403), redirect to transactions index with error message
            return redirect()->route('transactions.index')
                ->with('error', 'You do not have permission to view this transaction.');
        }

        $transaction->load(['category', 'settlements.category']);

        // Get settlement summary for payable/receivable transactions
        $settlementSummary = null;
        if (in_array($transaction->type, ['payable', 'receivable'])) {
            // Calculate settled amount from actual settlement records for accuracy
            $actualSettledAmount = $transaction->settlements->sum('amount');
            
            // Get secondary currency information
            $secondaryCurrency = $transaction->metadata['secondary_currency'] ?? null;
            $exchangeRate = $transaction->metadata['exchange_rate'] ?? null;
            $secondaryTotalAmount = $transaction->metadata['secondary_amount'] ?? null;
            
            // Calculate secondary amounts for settlement summary
            $secondarySettledAmount = null;
            $secondaryRemainingAmount = null;
            
            if ($secondaryCurrency && $exchangeRate && $secondaryTotalAmount) {
                // Calculate secondary settled amount from actual settlement records
                $secondarySettledAmount = 0;
                foreach ($transaction->settlements as $settlement) {
                    if (isset($settlement->metadata['secondary_amount'])) {
                        $secondarySettledAmount += $settlement->metadata['secondary_amount'];
                    }
                }
                $secondaryRemainingAmount = $secondaryTotalAmount - $secondarySettledAmount;
            }
            
            $settlementSummary = [
                'total_amount' => $transaction->amount,
                'settled_amount' => $actualSettledAmount,
                'remaining_amount' => $transaction->amount - $actualSettledAmount,
                'status' => $this->calculateSettlementStatus($transaction->amount, $actualSettledAmount),
                'secondary_currency' => $secondaryCurrency,
                'secondary_total_amount' => $secondaryTotalAmount,
                'secondary_settled_amount' => $secondarySettledAmount,
                'secondary_remaining_amount' => $secondaryRemainingAmount,
                'exchange_rate' => $exchangeRate,
                'settlements' => $transaction->settlements->map(function ($settlement) {
                    return [
                        'id' => $settlement->id,
                        'date' => $settlement->date->format('Y-m-d'),
                        'amount' => $settlement->amount,
                        'description' => $settlement->description,
                        'category' => $settlement->category->name,
                        'category_color' => $settlement->category->color,
                        'secondary_amount' => $settlement->metadata['secondary_amount'] ?? null,
                    ];
                }),
            ];
        }

        // Get settlement categories based on transaction type
        $settlementCategories = [];
        if ($transaction->type === 'payable') {
            $settlementCategories = Category::where('type', 'settle_payable')->active()->get();
        } elseif ($transaction->type === 'receivable') {
            $settlementCategories = Category::where('type', 'settle_receivable')->active()->get();
        }

        return Inertia::render('transaction-view', [
            'transaction' => $transaction,
            'settlementSummary' => $settlementSummary,
            'settlementCategories' => $settlementCategories,
            'id' => $transaction->id,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        $user = Auth::user();



        // Admins and super admins can edit any transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            // Instead of abort(403), redirect to transactions index with error message
            return redirect()->route('transactions.index')
                ->with('error', 'You do not have permission to edit this transaction.');
        }

        $categories = Category::active()->get();
        $transaction->load('category');

        // Ensure date is in proper YYYY-MM-DD format for frontend
        if ($transaction->date) {
            $transaction->date = $transaction->date->format('Y-m-d');
        }

        return Inertia::render('transaction-edit', [
            'transaction' => $transaction,
            'categories' => $categories,
            'id' => $transaction->id,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        $user = Auth::user();

        // Admins and super admins can update any transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            abort(403);
        }

        // Find or create category by name and type (similar to store method)
        $categoryId = $request->category_id;

        if (!$categoryId && $request->category) {
            // First try to find by name and type
            $category = Category::where('name', $request->category)
                ->where('type', $request->type)
                ->first();
            
            // If not found, try to find by slug
            if (!$category) {
                $slug = \Str::slug($request->category);
                $category = Category::where('slug', $slug)->first();
            }
            
            // If still not found, create new category
            if (!$category) {
                $category = Category::create([
                    'name' => $request->category,
                    'type' => $request->type,
                    'slug' => $slug,
                    'color' => $this->getDefaultCategoryColor($request->type),
                    'is_active' => true,
                ]);
            }
            
            $categoryId = $category->id;
        }

        $transaction->update([
            'category_id' => $categoryId,
            'date' => $request->date,
            'description' => $request->description,
            'type' => $request->type,
            'amount' => $request->amount,
            'currency' => $request->currency ?? $transaction->currency,
            'source' => $request->source,
            'notes' => $request->notes,
            'status' => $request->status ?? $transaction->status,
            'metadata' => $request->metadata,
        ]);

        // Create notification for transaction update
        $this->createTransactionNotification($transaction, 'updated');

        // Notify admins about the transaction update (exclude current user if they're an admin)
        $excludeUserId = in_array(Auth::user()->role, ['admin', 'super_admin']) ? Auth::id() : null;
        AdminNotificationService::notifyTransactionAction(
            'updated',
            Auth::user()->name,
            $transaction->type,
            $transaction->amount,
            $transaction->currency,
            $excludeUserId
        );

        // Redirect to transaction list with success message
        return to_route('transaction')->with('success', 'Transaction updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        $user = Auth::user();



        // Admins and super admins can delete any transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            // Return JSON error for AJAX requests
            if (request()->expectsJson()) {
                return response()->json(['error' => 'You do not have permission to delete this transaction.'], 403);
            }
            // Otherwise redirect with error message
            return redirect()->route('transactions.index')
                ->with('error', 'You do not have permission to delete this transaction.');
        }

        // Cannot delete a transaction that has settlement(s) linked to it (parent row)
        $settlementsCount = $transaction->settlements()->count();
        if ($settlementsCount > 0) {
            $message = $settlementsCount === 1
                ? 'This transaction cannot be deleted because it has 1 settlement entry linked to it. Delete the settlement from the transaction detail page first, then delete this transaction.'
                : "This transaction cannot be deleted because it has {$settlementsCount} settlement entries linked to it. Delete the settlements from the transaction detail page first, then delete this transaction.";
            if (request()->expectsJson() || request()->header('X-Inertia')) {
                return back()->withErrors(['delete' => $message])->withInput();
            }
            return redirect()->route('transactions.index')->with('error', $message);
        }

        // Store transaction info before deletion for admin notification
        $transactionInfo = [
            'type' => $transaction->type,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
        ];

        // If this is a settlement transaction, update the related transaction's settled_amount
        if ($transaction->type === 'settlement' && $transaction->related_transaction_id) {
            $relatedTransaction = Transaction::find($transaction->related_transaction_id);
            if ($relatedTransaction) {
                $newSettledAmount = max(0, $relatedTransaction->settled_amount - $transaction->amount);
                $relatedTransaction->update([
                    'settled_amount' => $newSettledAmount,
                    'status' => $this->calculateSettlementStatus($relatedTransaction->amount, $newSettledAmount),
                    'settled_at' => $newSettledAmount >= $relatedTransaction->amount ? now() : null,
                ]);
            }
        }

        try {
            $transaction->delete();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000' || str_contains($e->getMessage(), 'foreign key constraint')) {
                $message = 'This transaction cannot be deleted because other records (such as settlement entries) are linked to it. Open the transaction, remove or delete those entries first, then try again.';
                if (request()->expectsJson() || request()->header('X-Inertia')) {
                    return back()->withErrors(['delete' => $message])->withInput();
                }
                return redirect()->route('transactions.index')->with('error', $message);
            }
            throw $e;
        }

        // Notify admins about the transaction deletion (exclude current user if they're an admin)
        $excludeUserId = in_array(Auth::user()->role, ['admin', 'super_admin']) ? Auth::id() : null;
        AdminNotificationService::notifyTransactionAction(
            'deleted',
            Auth::user()->name,
            $transactionInfo['type'],
            $transactionInfo['amount'],
            $transactionInfo['currency'],
            $excludeUserId
        );

        // Return success response for Inertia (frontend will handle any redirect)
        return back()->with('success', 'Transaction deleted successfully.');
    }

    /**
     * Show the form for creating a new income transaction.
     */
    public function addIncome()
    {
        $categories = Category::active()->ofType('income')->orderBy('name')->get();

        return Inertia::render('transactions/add-income', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new expense transaction.
     */
    public function addExpense()
    {
        $categories = Category::active()->ofType('expense')->orderBy('name')->get();

        return Inertia::render('transactions/add-expense', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new receivable transaction.
     */
    public function addReceivable()
    {
        $categories = Category::active()->ofType('receivable')->orderBy('name')->get();

        return Inertia::render('transactions/add-receivable', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new payable transaction.
     */
    public function addPayable()
    {
        $categories = Category::active()->ofType('payable')->orderBy('name')->get();

        return Inertia::render('transactions/add-payable', [
            'categories' => $categories,
        ]);
    }

    public function settle(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . ($transaction->amount - $transaction->settled_amount),
            'description' => 'required|string|max:255',
            'category' => 'required|string|in:settle_payable,settle_receivable',
            'date' => 'required|date|before_or_equal:today',
            'secondary_amount' => 'nullable|numeric|min:0',
            'exchange_rate' => 'nullable|numeric|min:0.0001',
        ]);

        $settlement = app(SettlementService::class)->createSettlement($transaction, $validated);

        return redirect()->back()->with('success', 'Settlement created successfully');
    }

    /**
     * Calculate settlement status based on total amount and settled amount
     */
    private function calculateSettlementStatus($totalAmount, $settledAmount)
    {
        if ($settledAmount == 0) return 'pending';
        if ($settledAmount < $totalAmount) return 'partial';
        if ($settledAmount >= $totalAmount) return 'completed';
        return 'pending';
    }
}
