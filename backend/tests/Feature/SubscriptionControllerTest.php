<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

class SubscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['plan' => 'free']);
        config(['services.xendit.api_key' => 'test_xendit_api_key']);
    }

    public function testCheckoutCreatesInvoiceRecord()
    {
        Sanctum::actingAs($this->user);

        // Fake the Xendit API response
        Http::fake([
            'https://api.xendit.co/v2/invoices' => Http::response([
                'id' => 'xend-inv-12345',
                'invoice_url' => 'https://checkout.xendit.co/web/xend-inv-12345',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/subscription/checkout', [
            'plan' => 'pro',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['checkout_url', 'invoice_id']);

        $this->assertDatabaseHas('invoices', [
            'user_id' => $this->user->id,
            'xendit_invoice_id' => 'xend-inv-12345',
            'status' => 'pending',
        ]);
    }

    public function testWebhookUpgradesUserToPro()
    {
        // Setup pending invoice
        $invoice = Invoice::create([
            'user_id' => $this->user->id,
            'xendit_invoice_id' => 'xend-inv-12345',
            'amount' => 149000,
            'status' => 'pending',
            'invoice_url' => 'https://checkout.xendit.co/web/xend-inv-12345',
        ]);

        // Set env callback token
        $token = 'test_webhook_token';
        putenv("XENDIT_CALLBACK_TOKEN={$token}");

        $payload = [
            'id' => 'xend-inv-12345',
            'status' => 'PAID',
        ];

        $response = $this->postJson('/api/v1/webhook/xendit', $payload, [
            'X-CALLBACK-TOKEN' => $token,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'plan' => 'pro',
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $this->user->id,
            'plan' => 'pro',
        ]);
    }

    public function testWebhookRejectsInvalidToken()
    {
        $token = 'correct_token';
        putenv("XENDIT_CALLBACK_TOKEN={$token}");

        $response = $this->postJson('/api/v1/webhook/xendit', [], [
            'X-CALLBACK-TOKEN' => 'wrong_token',
        ]);

        $response->assertStatus(401);
    }

    public function testStatusReturnsCurrentPlan()
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/v1/subscription/status');

        $response->assertStatus(200);
        $response->assertJson([
            'plan' => 'free',
            'is_active' => false,
        ]);
    }
}
