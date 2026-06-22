<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\CsvParserService;
use App\Services\SummaryCalculatorService;

class MultiValueTest extends TestCase
{
    public function test_csv_parser_detects_multi_value_column()
    {
        $parser = new CsvParserService();

        // Sample rows mimicking parsed CSV data
        $rows = collect([
            ['Nama' => 'Budi', 'Keahlian' => 'Laravel, Vue', 'Penjualan' => '1000'],
            ['Nama' => 'Siti', 'Keahlian' => 'Vue, React', 'Penjualan' => '2000'],
            ['Nama' => 'Andi', 'Keahlian' => 'React', 'Penjualan' => '1500'],
        ]);

        $columns = $parser->detectColumns($rows);

        $keahlianCol = collect($columns)->firstWhere('name', 'Keahlian');

        $this->assertNotNull($keahlianCol);
        $this->assertEquals('string', $keahlianCol['type']);
        $this->assertTrue($keahlianCol['is_multi']);
        $this->assertEquals(',', $keahlianCol['delimiter']);
    }

    public function test_summary_calculator_aggregates_multi_value_breakdown()
    {
        $calculator = new SummaryCalculatorService();

        $rows = collect([
            ['Nama' => 'Budi', 'Keahlian' => 'Laravel, Vue', 'Penjualan' => '1000'],
            ['Nama' => 'Siti', 'Keahlian' => 'Vue, React', 'Penjualan' => '2000'],
            ['Nama' => 'Andi', 'Keahlian' => 'React', 'Penjualan' => '1500'],
        ]);

        $breakdown = $calculator->breakdown($rows, 'Keahlian', ['Penjualan']);

        // Expected totals:
        // Vue: 1000 (from Budi) + 2000 (from Siti) = 3000
        // React: 2000 (from Siti) + 1500 (from Andi) = 3500
        // Laravel: 1000 (from Budi) = 1000

        $vueBreakdown = collect($breakdown)->firstWhere('group', 'Vue');
        $reactBreakdown = collect($breakdown)->firstWhere('group', 'React');
        $laravelBreakdown = collect($breakdown)->firstWhere('group', 'Laravel');

        $this->assertNotNull($vueBreakdown);
        $this->assertEquals(3000, $vueBreakdown['Penjualan']);

        $this->assertNotNull($reactBreakdown);
        $this->assertEquals(3500, $reactBreakdown['Penjualan']);

        $this->assertNotNull($laravelBreakdown);
        $this->assertEquals(1000, $laravelBreakdown['Penjualan']);
    }
}
