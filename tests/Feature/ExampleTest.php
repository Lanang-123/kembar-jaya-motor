<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_returns_a_successful_response(): void
    {
        // Simulasi: Seseorang (belum login) mencoba mengakses root web '/'
        $response = $this->get('/');

        // Ekspektasi: Sistem harus memblokir dan melempar (Redirect/302) ke halaman login
        $response->assertStatus(302);
        $response->assertRedirect(route('login'));
    }
}
