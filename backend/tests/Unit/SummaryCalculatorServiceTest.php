<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\SummaryCalculatorService;

class SummaryCalculatorServiceTest extends TestCase
{
    private SummaryCalculatorService $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new SummaryCalculatorService();
    }

    public function testCalculateBasicMetrics()
    {
        $rows = collect([
            ['Amount Spent' => '100'],
            ['Amount Spent' => '200'],
            ['Amount Spent' => '300'],
        ]);

        $result = $this->calculator->calculate($rows, ['Amount Spent']);

        $this->assertArrayHasKey('Amount Spent', $result);
        $this->assertEquals(600, $result['Amount Spent']['sum']);
        $this->assertEquals(200, $result['Amount Spent']['avg']);
        $this->assertEquals(100, $result['Amount Spent']['min']);
        $this->assertEquals(300, $result['Amount Spent']['max']);
        $this->assertEquals(3, $result['Amount Spent']['count']);
    }

    public function testCalculateDeltaPercent()
    {
        $rows = collect([['Amount Spent' => '600']]);
        $prevRows = collect([['Amount Spent' => '400']]);

        $result = $this->calculator->calculate($rows, ['Amount Spent'], $prevRows);

        $this->assertEquals(50.0, $result['Amount Spent']['delta_percent']);
    }

    public function testCalculateNegativeDelta()
    {
        $rows = collect([['Amount Spent' => '300']]);
        $prevRows = collect([['Amount Spent' => '600']]);

        $result = $this->calculator->calculate($rows, ['Amount Spent'], $prevRows);

        $this->assertEquals(-50.0, $result['Amount Spent']['delta_percent']);
    }

    public function testBreakdownByGroup()
    {
        $rows = collect([
            ['Campaign' => 'A', 'Spend' => '100'],
            ['Campaign' => 'A', 'Spend' => '200'],
            ['Campaign' => 'B', 'Spend' => '300'],
        ]);

        $breakdown = $this->calculator->breakdown($rows, 'Campaign', ['Spend']);

        $campaignA = collect($breakdown)->firstWhere('group', 'A');
        $campaignB = collect($breakdown)->firstWhere('group', 'B');

        $this->assertEquals(300, $campaignA['Spend']);
        $this->assertEquals(50.0, $campaignA['Spend_pct']);
        $this->assertEquals(300, $campaignB['Spend']);
        $this->assertEquals(50.0, $campaignB['Spend_pct']);
    }

    public function testEmptyRowsReturnsEmpty()
    {
        $result = $this->calculator->calculate(collect(), ['Spend']);
        $this->assertEquals([], $result);
    }

    public function testCtrFormula()
    {
        $row = ['Klik' => 100, 'Jangkauan' => 1000];
        $steps = [
            ['operand' => 'Klik', 'operator' => '÷'],
            ['operand' => 'Jangkauan', 'operator' => '×'],
            ['operand' => 100, 'operator' => null],
        ];

        $res = $this->calculator->evaluateFormula($row, $steps);
        $this->assertEquals(10.0, $res);
    }

    public function testDivisionByZero()
    {
        $row = ['Klik' => 100, 'Jangkauan' => 0];
        $steps = [
            ['operand' => 'Klik', 'operator' => '÷'],
            ['operand' => 'Jangkauan', 'operator' => null],
        ];

        $res = $this->calculator->evaluateFormula($row, $steps);
        $this->assertEquals(0.0, $res);
    }

    public function testColumnMapping()
    {
        $row = ['Link Clicks' => 100, 'Reach' => 1000];
        $steps = [
            ['operand' => 'Klik', 'operator' => '÷'],
            ['operand' => 'Jangkauan', 'operator' => '×'],
            ['operand' => 100, 'operator' => null],
        ];
        $mapping = ['Klik' => 'Link Clicks', 'Jangkauan' => 'Reach'];

        $res = $this->calculator->evaluateFormula($row, $steps, $mapping);
        $this->assertEquals(10.0, $res);
    }
}
