<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs(User::factory()->create([
        'permissions' => ['view_dashboard'],
    ]));

    $this->get('/dashboard')->assertOk();
});

test('authenticated users without dashboard permission cannot visit the dashboard', function () {
    $this->actingAs(User::factory()->create([
        'permissions' => [],
    ]));

    $this->get('/dashboard')->assertRedirect(route('settings.profile.edit', absolute: false));
});