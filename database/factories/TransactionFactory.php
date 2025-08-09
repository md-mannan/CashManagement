<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['income', 'expense', 'receivable', 'payable']);
        $status = $type === 'income' || $type === 'expense' ? 'completed' : $this->faker->randomElement(['pending', 'completed']);

        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'date' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'description' => $this->faker->sentence(3),
            'type' => $type,
            'amount' => $this->faker->randomFloat(2, 10, 5000),
            'currency' => $this->faker->randomElement(['USD', 'EUR', 'KWD']),
            'source' => $this->faker->optional()->company(),
            'notes' => $this->faker->optional()->sentence(),
            'status' => $status,
            'due_date' => $status === 'pending' ? $this->faker->dateTimeBetween('now', '+30 days') : null,
            'metadata' => null,
        ];
    }

    /**
     * Indicate that the transaction is income.
     */
    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
            'status' => 'completed',
            'due_date' => null,
        ]);
    }

    /**
     * Indicate that the transaction is expense.
     */
    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
            'status' => 'completed',
            'due_date' => null,
        ]);
    }

    /**
     * Indicate that the transaction is receivable.
     */
    public function receivable(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'receivable',
            'status' => $this->faker->randomElement(['pending', 'completed']),
            'due_date' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }

    /**
     * Indicate that the transaction is payable.
     */
    public function payable(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'payable',
            'status' => $this->faker->randomElement(['pending', 'completed']),
            'due_date' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }

    /**
     * Indicate that the transaction is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'due_date' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }

    /**
     * Indicate that the transaction is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'due_date' => null,
        ]);
    }
}
