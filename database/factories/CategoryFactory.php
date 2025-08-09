<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(2, true);
        $type = $this->faker->randomElement(['income', 'expense', 'receivable', 'payable']);

        $colors = [
            'income' => ['#10B981', '#059669', '#0D9488', '#0891B2', '#0EA5E9'],
            'expense' => ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7C2D12'],
            'receivable' => ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
            'payable' => ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
        ];

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'type' => $type,
            'color' => $this->faker->randomElement($colors[$type]),
            'icon' => $this->faker->randomElement(['Banknote', 'CreditCard', 'ShoppingBag', 'Car', 'Home', 'Heart', 'BookOpen']),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the category is for income.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
            'color' => $this->faker->randomElement(['#10B981', '#059669', '#0D9488', '#0891B2', '#0EA5E9']),
        ]);
    }

    /**
     * Indicate that the category is for expense.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
            'color' => $this->faker->randomElement(['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7C2D12']),
        ]);
    }

    /**
     * Indicate that the category is for receivable.
     */
    public function receivable(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'receivable',
            'color' => $this->faker->randomElement(['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95']),
        ]);
    }

    /**
     * Indicate that the category is for payable.
     */
    public function payable(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'payable',
            'color' => $this->faker->randomElement(['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F']),
        ]);
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
