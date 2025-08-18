<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Transaction;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Admins and super admins can view all transactions
        if ($user->isAdmin()) {
            $query = Transaction::with(['category', 'user'])
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc');
        } else {
            $query = Transaction::with('category')
                ->forUser($user->id)
                ->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc');
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

        // Filter by user if admin is viewing specific user's transactions
        if ($user->isAdmin() && $request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->paginate(10);

        return Inertia::render('transaction', [
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'search', 'category_id', 'user_id']),
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
                ->orderBy('date', 'desc');
        } else {
            $query = Transaction::with('category')
                ->forUser($user->id)
                ->orderBy('date', 'desc');
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

        // Filter by user if admin is viewing specific user's transactions
        if ($user->isAdmin() && $request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->get();

        // Calculate summary data
        $summary = [
            'total_income' => $transactions->where('type', 'income')->sum('amount'),
            'total_expenses' => $transactions->where('type', 'expense')->sum('amount'),
            'total_receivables' => $transactions->where('type', 'receivable')->sum('amount'),
            'total_payables' => $transactions->where('type', 'payable')->sum('amount'),
            'net_balance' => ($transactions->where('type', 'income')->sum('amount') + $transactions->where('type', 'receivable')->sum('amount')) - ($transactions->where('type', 'expense')->sum('amount') + $transactions->where('type', 'payable')->sum('amount')),
        ];

        return Inertia::render('ledger', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'search', 'category_id', 'user_id']),
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
        $category = Category::firstOrCreate([
            'name' => $request->category,
            'type' => $request->type,
        ], [
            'slug' => \Str::slug($request->category),
            'color' => $this->getDefaultCategoryColor($request->type),
            'is_active' => true,
        ]);

        $transaction = Transaction::create([
            'user_id' => Auth::id(),
            'category_id' => $category->id,
            'date' => $request->date,
            'description' => $request->description,
            'type' => $request->type,
            'amount' => $request->amount,
            'currency' => $request->currency ?? Auth::user()->primary_currency,
            'source' => $request->source,
            'notes' => $request->notes,
            'status' => $request->status ?? 'completed',
            'due_date' => $request->due_date,
            'metadata' => $request->metadata,
        ]);

        // Create notification for transaction creation
        $this->createTransactionNotification($transaction, 'created');

        // Notify admins about the transaction creation
        AdminNotificationService::notifyTransactionAction(
            'created',
            Auth::user()->name,
            $transaction->type,
            $transaction->amount,
            $transaction->currency
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

        Notification::createForUser(
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
            ]
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        $user = Auth::user();

        // Debug logging
        \Log::info('=== TRANSACTION SHOW ACCESSED ===', [
            'transaction_id' => $transaction->id,
            'transaction_user_id' => $transaction->user_id,
            'current_user_id' => $user ? $user->id : 'NOT_AUTHENTICATED',
            'user_is_admin' => $user ? $user->isAdmin() : false,
            'request_url' => request()->fullUrl(),
            'request_method' => request()->method(),
            'user_name' => $user ? $user->name : 'NOT_AUTHENTICATED',
        ]);

        // Check if user is authenticated
        if (!$user) {
            \Log::warning('Unauthenticated user trying to access transaction', [
                'transaction_id' => $transaction->id,
                'request_url' => request()->fullUrl(),
            ]);
            return redirect()->route('dashboard')->with('error', 'Please log in to access transactions.');
        }

        // Admins and super admins can view any transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            \Log::warning('Transaction access denied', [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
            ]);
            // Instead of abort(403), redirect to transactions index with error message
            return redirect()->route('transactions.index')
                ->with('error', 'You do not have permission to view this transaction.');
        }

        $transaction->load('category');

        return Inertia::render('transaction-view', [
            'transaction' => $transaction,
            'id' => $transaction->id,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        $user = Auth::user();

        // Debug logging
        \Log::info('Transaction edit accessed', [
            'transaction_id' => $transaction->id,
            'transaction_user_id' => $transaction->user_id,
            'current_user_id' => $user->id,
            'user_is_admin' => $user->isAdmin(),
        ]);

        // Admins and super admins can edit any transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            \Log::warning('Transaction edit access denied', [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
            ]);
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
            $category = Category::firstOrCreate([
                'name' => $request->category,
                'type' => $request->type,
            ], [
                'slug' => \Str::slug($request->category),
                'color' => $this->getDefaultCategoryColor($request->type),
                'is_active' => true,
            ]);
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
            'due_date' => $request->due_date,
            'metadata' => $request->metadata,
        ]);

        // Create notification for transaction update
        $this->createTransactionNotification($transaction, 'updated');

        // Notify admins about the transaction update
        AdminNotificationService::notifyTransactionAction(
            'updated',
            Auth::user()->name,
            $transaction->type,
            $transaction->amount,
            $transaction->currency
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

        // Debug logging
        \Log::info('Transaction destroy accessed', [
            'transaction_id' => $transaction->id,
            'transaction_user_id' => $transaction->user_id,
            'current_user_id' => $user->id,
            'user_is_admin' => $user->isAdmin(),
        ]);

        // Admins and super admins can delete any transaction
        if (!$user->isAdmin() && $transaction->user_id !== $user->id) {
            \Log::warning('Transaction delete access denied', [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
            ]);
            // Return JSON error for AJAX requests
            if (request()->expectsJson()) {
                return response()->json(['error' => 'You do not have permission to delete this transaction.'], 403);
            }
            // Otherwise redirect with error message
            return redirect()->route('transactions.index')
                ->with('error', 'You do not have permission to delete this transaction.');
        }

        // Store transaction info before deletion for admin notification
        $transactionInfo = [
            'type' => $transaction->type,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
        ];

        $transaction->delete();

        // Notify admins about the transaction deletion
        AdminNotificationService::notifyTransactionAction(
            'deleted',
            Auth::user()->name,
            $transactionInfo['type'],
            $transactionInfo['amount'],
            $transactionInfo['currency']
        );

        // Return success response for Inertia (frontend will handle any redirect)
        return back()->with('success', 'Transaction deleted successfully.');
    }
}
