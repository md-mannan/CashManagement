<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\AdminNotificationService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->hasPermission('view_all_user_data')) {
            $categories = Category::with('transactions')
                ->orderBy('name')
                ->get();
        } else {
            $categories = Category::active()
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('categories', [
            'categories' => $categories,
            'isAdmin' => $user->canManageCategories(),
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
            'type' => 'required|in:income,expense,receivable,payable,settle_payable,settle_receivable',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
        ]);

        $slug = Str::slug($request->name);
        $this->assertCategorySlugIsUnique($slug);

        try {
            $category = Category::create([
                'name' => $request->name,
                'slug' => $slug,
                'type' => $request->type,
                'color' => $request->color ?? $this->getDefaultCategoryColor($request->type),
                'icon' => $request->icon,
                'is_active' => true,
            ]);
        } catch (UniqueConstraintViolationException) {
            throw $this->duplicateCategoryValidationException();
        }

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
            'type' => 'required|in:income,expense,receivable,payable,settle_payable,settle_receivable',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $slug = Str::slug($request->name);
        $this->assertCategorySlugIsUnique($slug, $category->id);

        try {
            $category->update([
                'name' => $request->name,
                'slug' => $slug,
                'type' => $request->type,
                'color' => $request->color ?? $category->color,
                'icon' => $request->icon,
                'is_active' => $request->is_active ?? $category->is_active,
            ]);
        } catch (UniqueConstraintViolationException) {
            throw $this->duplicateCategoryValidationException();
        }

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
     * @throws ValidationException
     */
    private function assertCategorySlugIsUnique(string $slug, ?int $ignoreCategoryId = null): void
    {
        if ($slug === '') {
            throw ValidationException::withMessages([
                'name' => [__('Use a name that includes letters or numbers so we can create a unique link for this category.')],
            ]);
        }

        $query = Category::query()->where('slug', $slug);
        if ($ignoreCategoryId !== null) {
            $query->where('id', '!=', $ignoreCategoryId);
        }

        if ($query->exists()) {
            throw $this->duplicateCategoryValidationException();
        }
    }

    private function duplicateCategoryValidationException(): ValidationException
    {
        return ValidationException::withMessages([
            'name' => [__('A category with this name already exists. Choose a different name.')],
        ]);
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
            'settle_payable' => '#F59E0B', // Orange (lighter shade)
            'settle_receivable' => '#3B82F6', // Blue (lighter shade)
            default => '#6B7280', // Gray
        };
    }

    /**
     * Create notification for category actions
     */
    private function createCategoryNotification(Category $category, string $action): void
    {
        // Notifications removed
    }
}
