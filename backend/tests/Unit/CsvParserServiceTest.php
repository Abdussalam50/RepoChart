<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\CsvParserService;
use Illuminate\Http\UploadedFile;

class CsvParserServiceTest extends TestCase
{
    private CsvParserService $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new CsvParserService();
    }

    public function testDetectColumnsFromRows()
    {
        $rows = collect([
            ['Tanggal' => '2026-05-31', 'Spend' => '120000', 'Campaign' => 'Campaign A'],
            ['Tanggal' => '2026-05-30', 'Spend' => '130000', 'Campaign' => 'Campaign B'],
        ]);

        $columns = $this->parser->detectColumns($rows);

        $this->assertCount(3, $columns);
        $this->assertEquals('Tanggal', $columns[0]['name']);
        $this->assertEquals('date', $columns[0]['type']);

        $this->assertEquals('Spend', $columns[1]['name']);
        $this->assertEquals('number', $columns[1]['type']);

        $this->assertEquals('Campaign', $columns[2]['name']);
        $this->assertEquals('string', $columns[2]['type']);
    }

    public function testParseCsvSkipsEmptyRows()
    {
        $csvContent = "Tanggal,Spend\n2026-05-31,120000\n,\n2026-05-30,130000\n";
        $tempPath = tempnam(sys_get_temp_dir(), 'test_csv_');
        file_put_contents($tempPath, $csvContent);

        $file = new UploadedFile($tempPath, 'test.csv', 'text/csv', null, true);
        $result = $this->parser->parse($file);

        $this->assertCount(2, $result);
        unlink($tempPath);
    }

    public function testParseCsvHandlesMismatchedRows()
    {
        $csvContent = "Tanggal,Spend,Clicks\n2026-05-31,120000,100\n2026-05-30,130000\n2026-05-29,140000,150,extra\n";
        $tempPath = tempnam(sys_get_temp_dir(), 'test_csv_');
        file_put_contents($tempPath, $csvContent);

        $file = new UploadedFile($tempPath, 'test.csv', 'text/csv', null, true);
        $result = $this->parser->parse($file);

        $this->assertCount(1, $result);
        $this->assertEquals('2026-05-31', $result->first()['Tanggal']);
        unlink($tempPath);
    }

    public function testDetectMultiValueWithSemicolon()
    {
        $rows = collect([
            ['Kategori' => 'Sepatu; Olahraga'],
            ['Kategori' => 'Pakaian; Santai'],
            ['Kategori' => 'Aksesoris'],
        ]);

        $columns = $this->parser->detectColumns($rows);
        $kategori = collect($columns)->firstWhere('name', 'Kategori');

        $this->assertTrue($kategori['is_multi']);
        $this->assertEquals(';', $kategori['delimiter']);
    }

    public function testDetectMultiValueWithComma()
    {
        $rows = collect([
            ['Tag' => 'promo, diskon'],
            ['Tag' => 'baru, laris'],
            ['Tag' => 'cuci gudang'],
        ]);

        $columns = $this->parser->detectColumns($rows);
        $tag = collect($columns)->firstWhere('name', 'Tag');

        $this->assertTrue($tag['is_multi']);
        $this->assertEquals(',', $tag['delimiter']);
    }
}
