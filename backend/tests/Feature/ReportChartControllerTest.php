<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Client;
use App\Models\Report;
use App\Models\ReportChart;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ReportChartControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Client $client;
    private Report $report;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->client = Client::factory()->create();
        $this->report = Report::factory()->create([
            'user_id' => $this->user->id,
            'client_id' => $this->client->id,
        ]);
    }

    public function testCanListChartsForOwnReport()
    {
        Sanctum::actingAs($this->user);

        ReportChart::factory()->count(3)->create([
            'report_id' => $this->report->id,
        ]);

        $response = $this->getJson("/api/v1/reports/{$this->report->id}/charts");

        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    public function testCannotListChartsForOtherUserReport()
    {
        $otherUser = User::factory()->create();
        Sanctum::actingAs($otherUser);

        $response = $this->getJson("/api/v1/reports/{$this->report->id}/charts");

        $response->assertStatus(403);
    }

    public function testCanCreateChart()
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'name' => 'Spend Harian',
            'type' => 'line',
            'config_json' => [
                'axisX' => 'Tanggal',
                'axisY' => 'Amount Spent'
            ],
            'sort_order' => 1
        ];

        $response = $this->postJson("/api/v1/reports/{$this->report->id}/charts", $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('report_charts', [
            'report_id' => $this->report->id,
            'name' => 'Spend Harian',
        ]);
    }

    public function testCreateChartValidation()
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'name' => '', // Empty
            'type' => 'invalid_type', // Invalid
            'config_json' => []
        ];

        $response = $this->postJson("/api/v1/reports/{$this->report->id}/charts", $payload);

        $response->assertStatus(422);
    }

    public function testCanUpdateChart()
    {
        Sanctum::actingAs($this->user);

        $chart = ReportChart::factory()->create([
            'report_id' => $this->report->id,
        ]);

        $payload = [
            'name' => 'Updated Chart Name',
            'type' => 'bar',
            'config_json' => [
                'axisX' => 'Campaign Name',
                'axisY' => 'Link Clicks'
            ],
        ];

        $response = $this->putJson("/api/v1/reports/{$this->report->id}/charts/{$chart->id}", $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('report_charts', [
            'id' => $chart->id,
            'name' => 'Updated Chart Name',
        ]);
    }

    public function testCanDeleteChart()
    {
        Sanctum::actingAs($this->user);

        $chart = ReportChart::factory()->create([
            'report_id' => $this->report->id,
        ]);

        $response = $this->deleteJson("/api/v1/reports/{$this->report->id}/charts/{$chart->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('report_charts', [
            'id' => $chart->id,
        ]);
    }

    public function testCanReorderCharts()
    {
        Sanctum::actingAs($this->user);

        $chart1 = ReportChart::factory()->create(['report_id' => $this->report->id, 'sort_order' => 1]);
        $chart2 = ReportChart::factory()->create(['report_id' => $this->report->id, 'sort_order' => 2]);

        $payload = [
            'items' => [
                ['id' => $chart1->id, 'sort_order' => 10],
                ['id' => $chart2->id, 'sort_order' => 20],
            ]
        ];

        $response = $this->patchJson("/api/v1/reports/{$this->report->id}/charts/reorder", $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('report_charts', ['id' => $chart1->id, 'sort_order' => 10]);
        $this->assertDatabaseHas('report_charts', ['id' => $chart2->id, 'sort_order' => 20]);
    }
}
