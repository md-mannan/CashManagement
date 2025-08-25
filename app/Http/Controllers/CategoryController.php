<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Notification;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        // Admins and super admins can view all categories
        if ($user->isAdmin()) {
            $categories = Category::with('transactions')
                ->orderBy('name')
                ->get();
        } else {
            // Regular users can only view active categories
            $categories = Category::active()
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('categories', [
            'categories' => $categories,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense,receivable,payable',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'type' => $request->type,
            'color' => $request->color ?? $this->getDefaultCategoryColor($request->type),
            'icon' => $request->icon,
            'is_active' => true,
        ]);

        // Create notification for category creation
        $this->createCategoryNotification($category, 'created');

        // Notify admins about the category creation (excluding current user to avoid duplicates)
        AdminNotificationService::notifyCategoryAction(
            'created',
            Auth::user()->name,
            $category->name,
            $category->type,
            Auth::id() // Pass current user ID to exclude them
        );

        return back()->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense,receivable,payable',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'type' => $request->type,
            'color' => $request->color ?? $category->color,
            'icon' => $request->icon,
            'is_active' => $request->is_active ?? $category->is_active,
        ]);

        // Create notification for category update
        $this->createCategoryNotification($category, 'updated');

        // Notify admins about the category update (excluding current user to avoid duplicates)
        AdminNotificationService::notifyCategoryAction(
            'updated',
            Auth::user()->name,
            $category->name,
            $category->type,
            Auth::id() // Pass current user ID to exclude them
        );

        return back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);

        // Store category info before deletion for admin notification
        $categoryInfo = [
            'name' => $category->name,
            'type' => $category->type,
        ];

        $category->delete();

        // Notify admins about the category deletion (excluding current user to avoid duplicates)
        AdminNotificationService::notifyCategoryAction(
            'deleted',
            Auth::user()->name,
            $categoryInfo['name'],
            $categoryInfo['type'],
            Auth::id() // Pass current user ID to exclude them
        );

        return back()->with('success', 'Category deleted successfully.');
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
     * Create notification for category actions
     */
    private function createCategoryNotification(Category $category, string $action): void
    {
        $user = Auth::user();
        $actionText = $action === 'created' ? 'added' : 'updated';

        $title = "Category " . ucfirst($actionText);
        $message = "Your {$category->type} category '{$category->name}' has been {$actionText} successfully";

        $icon = match ($category->type) {
            'income' => 'TrendingUp',
            'expense' => 'TrendingDown',
            'receivable' => 'ArrowUpRight',
            'payable' => 'ArrowDownLeft',
            default => 'Tag',
        };

        $color = match ($category->type) {
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
                    'category_id' => $category->id,
                    'action' => $action,
                    'type' => $category->type,
                    'name' => $category->name,
                ],
            ]
        );
    }
}
