<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\PlatformDetectorService;

class PlatformDetectorServiceTest extends TestCase
{
    private PlatformDetectorService $detector;

    protected function setUp(): void
    {
        parent::setUp();
        $this->detector = new PlatformDetectorService();
    }

    public function testDetectsMetaAds()
    {
        $headers = ['Reach', 'Amount Spent', 'Link Clicks', 'Results', 'Frequency', 'Impressions', 'Campaign Name'];
        $result = $this->detector->detect($headers);

        $this->assertEquals('meta_ads', $result['platform']);
        $this->assertEquals(100, $result['confidence']);
    }

    public function testDetectsGoogleAds()
    {
        $headers = ['Clicks', 'Cost', 'Conversions', 'CTR', 'Avg. CPC', 'Impressions', 'Campaign'];
        $result = $this->detector->detect($headers);

        $this->assertEquals('google_ads', $result['platform']);
        $this->assertEquals(100, $result['confidence']);
    }

    public function testDetectsTikTokAds()
    {
        $headers = ['Video Views', 'Spend', 'CPM', 'Clicks', 'Conversions', 'Impressions'];
        $result = $this->detector->detect($headers);

        $this->assertEquals('tiktok_ads', $result['platform']);
        $this->assertEquals(100, $result['confidence']);
    }

    public function testFallsBackToGeneric()
    {
        $headers = ['Kolom A', 'Kolom B', 'Kolom C'];
        $result = $this->detector->detect($headers);

        $this->assertEquals('generic', $result['platform']);
        $this->assertLessThan(50, $result['confidence']);
    }

    public function testGetDefaultChartsMetaAds()
    {
        $headers = ['Tanggal', 'Amount Spent', 'Campaign Name', 'CTR'];
        $charts = $this->detector->getDefaultCharts('meta_ads', $headers);

        $this->assertCount(3, $charts);
        $this->assertEquals('Spend Harian', $charts[0]['name']);
        $this->assertEquals('Tanggal', $charts[0]['config_json']['axisX']);
        $this->assertEquals('Amount Spent', $charts[0]['config_json']['axisY']);
    }

    public function testGetDefaultChartsReturnsThreeCharts()
    {
        $charts = $this->detector->getDefaultCharts('generic', []);
        $this->assertCount(3, $charts);
    }

    public function testLowMatchCountFallsToGeneric()
    {
        // Only 2 fields matching
        $headers = ['Reach', 'Amount Spent'];
        $result = $this->detector->detect($headers);

        $this->assertEquals('generic', $result['platform']);
    }
}
