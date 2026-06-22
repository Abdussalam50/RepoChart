<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Bersihkan file CSV orphan setiap hari (safety net arsitektur privasi)
Schedule::command('repochart:verify-csv-cleanup')->daily();

// Kirim reminder otomatis untuk langganan yang akan expired
Schedule::command('app:send-subscription-reminders')->dailyAt('08:00');
