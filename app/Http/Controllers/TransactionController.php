<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Category;
use App\Models\Transaction;
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
        $query = Transaction::with('category')
            ->forUser(Auth::id())
            ->orderBy('date', 'desc');

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

        $transactions = $query->paginate(10);

        return Inertia::render('transaction', [
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'search', 'category_id']),
        ]);
    }

    /**
     * Display the ledger view.
     */
    public function ledger(Request $request)
    {
        $query = Transaction::with('category')
            ->forUser(Auth::id())
            ->orderBy('date', 'desc');

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
            'filters' => $request->only(['type', 'start_date', 'end_date', 'search', 'category_id']),
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

        // Return success response for Inertia (frontend will handle redirect)
        return back()->with('success', 'Transaction created successfully.');
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
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        // Ensure user owns this transaction
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
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
        // Ensure user owns this transaction
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
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
        // Ensure user owns this transaction
        if ($transaction->user_id !== Auth::id()) {
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

        // Return success response for Inertia (frontend will handle redirect)
        return back()->with('success', 'Transaction updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        // Ensure user owns this transaction
        if ($transaction->user_id !== Auth::id()) {
            abort(403);
        }

        $transaction->delete();

        // Return success response for Inertia (frontend will handle any redirect)
        return back()->with('success', 'Transaction deleted successfully.');
    }
}
