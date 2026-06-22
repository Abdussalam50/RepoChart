<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\SummaryCardService;

class SummaryCardServiceTest extends TestCase
{
    private SummaryCardService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SummaryCardService();
    }

    public function testMetaAdsHighFrequencyReturnsWarning()
    {
        $warning = $this->service->getWarning('meta_ads', 'frequency', 3.5);
        $this->assertNotNull($warning);
        $this->assertEquals('warning', $warning['level']);
        $this->assertEquals('Iklan mulai jenuh — pertimbangkan ganti creative', $warning['text']);
    }

    public function testMetaAdsLowCtrReturnsDanger()
    {
        $warning = $this->service->getWarning('meta_ads', 'ctr', 0.5);
        $this->assertNotNull($warning);
        $this->assertEquals('danger', $warning['level']);
        $this->assertEquals('CTR rendah — coba perbaiki visual atau copywriting', $warning['text']);
    }

    public function testMetaAdsLowRoasReturnsDanger()
    {
        $warning = $this->service->getWarning('meta_ads', 'roas', 0.8);
        $this->assertNotNull($warning);
        $this->assertEquals('danger', $warning['level']);
        $this->assertEquals('ROAS di bawah 1 — iklan belum balik modal', $warning['text']);
    }

    public function testGoogleAdsLowRoasReturnsDanger()
    {
        $warning = $this->service->getWarning('google_ads', 'roas', 0.5);
        $this->assertNotNull($warning);
        $this->assertEquals('danger', $warning['level']);
        $this->assertEquals('ROAS di bawah 1 — kampanye belum profitable', $warning['text']);
    }

    public function testGoodMetricsReturnNull()
    {
        $this->assertNull($this->service->getWarning('meta_ads', 'ctr', 2.5));
    }

    public function testUnknownPlatformReturnsNull()
    {
        $this->assertNull($this->service->getWarning('unknown', 'ctr', 0.1));
    }

    public function testFrequencyBelowThresholdReturnsNull()
    {
        $this->assertNull($this->service->getWarning('meta_ads', 'frequency', 2.0));
    }
}
