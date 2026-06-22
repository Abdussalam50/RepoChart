<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CsvUploadController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ReportChartController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SummaryController;
use App\Http\Middleware\EnsurePremiumPlan;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — RepoChart v1
|--------------------------------------------------------------------------
| Base: /api/v1
| Auth: Laravel Sanctum (Bearer token)
*/

Route::prefix('v1')->group(function () {

    // -----------------------------------------------------------------------
    // Authentication (Public)
    // -----------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login',    [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me',      [AuthController::class, 'me']);
        });
    });

    // Public Report Preview Data for browser/system PDF preview
    Route::get('reports/{report}/preview-data', [ReportController::class, 'previewData']);

    // Public Settings
    Route::get('settings/public', [\App\Http\Controllers\Admin\AdminSettingController::class, 'getPublicSettings']);

    // -----------------------------------------------------------------------
    // Xendit Webhook (public — verified by X-CALLBACK-TOKEN header)
    // -----------------------------------------------------------------------
    Route::post('webhook/xendit', [SubscriptionController::class, 'webhook']);

    // -----------------------------------------------------------------------
    // Shared Dashboard Public Route
    // -----------------------------------------------------------------------
    Route::middleware(['throttle:60,1'])->get('/dashboard/{token}', [\App\Http\Controllers\SharedDashboardController::class, 'show']);
    

    // -----------------------------------------------------------------------
    // Protected Routes (Sanctum)
    // -----------------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {

        // Clients
        Route::prefix('clients')->group(function () {
            Route::get('/',             [ClientController::class, 'index']);
            Route::post('/',            [ClientController::class, 'store']);
            Route::get('/{client}',     [ClientController::class, 'show']);
            Route::put('/{client}',     [ClientController::class, 'update']);
            Route::delete('/{client}',  [ClientController::class, 'destroy']);
            Route::post('/{client}/logo', [ClientController::class, 'uploadLogo']);
        });

        // Reports
        Route::prefix('reports')->group(function () {
            Route::get('/',            [ReportController::class, 'index']);
            Route::post('/',           [ReportController::class, 'store']);
            Route::get('/{report}',    [ReportController::class, 'show']);
            Route::put('/{report}',    [ReportController::class, 'update']);
            Route::delete('/{report}', [ReportController::class, 'destroy']);

            // Summary & Metrics
            Route::post('/{report}/calculate', [SummaryController::class, 'calculate']);
            Route::get('/{report}/summary',    [SummaryController::class, 'summary']);

            // AI Insight (Pro plan only)
            Route::middleware(EnsurePremiumPlan::class)->group(function () {
                Route::post('/{report}/insight', [InsightController::class, 'generate']);
                Route::get('/{report}/insight',  [InsightController::class, 'show']);

                // Narrative & Insight Edit
                Route::patch('/{report}/insight', [\App\Http\Controllers\NarrativeController::class, 'updateInsight']);
                Route::delete('/{report}/insight', [\App\Http\Controllers\NarrativeController::class, 'resetInsight']);

                Route::patch('/charts/{chartId}/narrative', [\App\Http\Controllers\NarrativeController::class, 'updateChartNarrative']);
                Route::delete('/charts/{chartId}/narrative', [\App\Http\Controllers\NarrativeController::class, 'resetChartNarrative']);

                // Shared Dashboard
                Route::post('/{report}/share', [\App\Http\Controllers\SharedDashboardController::class, 'create']);
                Route::get('/{report}/share', [\App\Http\Controllers\SharedDashboardController::class, 'getActiveLink']);
                Route::delete('/{report}/share', [\App\Http\Controllers\SharedDashboardController::class, 'revoke']);
            });

            // Insight status — no premium gate; any report owner can poll this
            Route::get('/{report}/insight-status', [InsightController::class, 'insightStatus']);

            // Chart CRUD per report
            Route::prefix('{report}/charts')->group(function () {
                Route::get('/',             [ReportChartController::class, 'index']);
                Route::post('/',            [ReportChartController::class, 'store']);
                // reorder must be declared BEFORE /{chart} to avoid being caught as a wildcard
                Route::patch('/reorder',    [ReportChartController::class, 'reorder']);
                Route::put('/{chart}',      [ReportChartController::class, 'update']);
                Route::delete('/{chart}',   [ReportChartController::class, 'destroy']);
            });

            // PDF Export
            Route::post('/{report}/export',       [ExportController::class, 'export']);
            Route::get('/{report}/pdf',           [ExportController::class, 'download']);
            Route::get('/{report}/preview-token', [ExportController::class, 'previewToken']);
        });

        // CSV Upload & Parsing
        Route::prefix('csv')->group(function () {
            Route::post('/upload',          [CsvUploadController::class, 'upload']);
            Route::get('/{report}/columns', [CsvUploadController::class, 'columns']);
            Route::get('/{report}/preview', [CsvUploadController::class, 'preview']);
            Route::get('/{report}/data',    [CsvUploadController::class, 'data']);
        });

        // Subscription & Payments
        Route::prefix('subscription')->group(function () {
            Route::post('/checkout', [SubscriptionController::class, 'checkout']);
            Route::get('/status',    [SubscriptionController::class, 'status']);
            Route::post('/beta-activate', [SubscriptionController::class, 'activateBeta']);
        });
        
        Route::post('/manual-payment', [\App\Http\Controllers\ManualPaymentController::class, 'store']);

        // Invoices
        Route::prefix('invoices')->group(function () {
            Route::get('/',                    [InvoiceController::class, 'getInvoices']);
            Route::get('/{invoiceId}',         [InvoiceController::class, 'getInvoiceDetails']);
            Route::post('/{invoiceId}/retry',  [InvoiceController::class, 'retryPayment']);
            Route::get('/{invoiceId}/status',  [InvoiceController::class, 'checkPaymentStatus']);
            Route::post('/{invoiceId}/cancel', [InvoiceController::class, 'cancelInvoice']);
            Route::get('/{invoiceId}/download', [InvoiceController::class, 'downloadInvoice']);
        });

        // -----------------------------------------------------------------------
        // Admin Routes
        // -----------------------------------------------------------------------
        Route::middleware('is_admin')->prefix('admin')->group(function () {
            // Dashboard
            Route::get('/overview', [\App\Http\Controllers\AdminController::class, 'overview']);
            Route::get('/growth', [\App\Http\Controllers\AdminController::class, 'growth']);
            Route::get('/retention', [\App\Http\Controllers\AdminController::class, 'retention']);
            Route::get('/alerts', [\App\Http\Controllers\AdminController::class, 'alerts']);
            Route::get('/transactions', [\App\Http\Controllers\AdminController::class, 'transactions']);
            Route::get('/subscriptions', [\App\Http\Controllers\AdminController::class, 'subscriptions']);

            // User Management CRUD
            Route::get('/users', [\App\Http\Controllers\Admin\AdminUserController::class, 'index']);
            Route::get('/users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'show']);
            Route::patch('/users/{user}/plan', [\App\Http\Controllers\Admin\AdminUserController::class, 'updatePlan']);
            Route::delete('/users/{user}', [\App\Http\Controllers\Admin\AdminUserController::class, 'destroy']);

            // Invoice Management CRUD
            Route::get('/invoices', [\App\Http\Controllers\Admin\AdminInvoiceController::class, 'index']);
            Route::post('/invoices', [\App\Http\Controllers\Admin\AdminInvoiceController::class, 'store']);
            Route::put('/invoices/{invoice}', [\App\Http\Controllers\Admin\AdminInvoiceController::class, 'update']);
            Route::delete('/invoices/{invoice}', [\App\Http\Controllers\Admin\AdminInvoiceController::class, 'destroy']);
            Route::patch('/invoices/{invoice}/mark-paid', [\App\Http\Controllers\Admin\AdminInvoiceController::class, 'markAsPaid']);

            // Subscription Management CRUD
            Route::get('/subs', [\App\Http\Controllers\Admin\AdminSubscriptionController::class, 'index']);
            Route::get('/subs/expiring', [\App\Http\Controllers\Admin\AdminSubscriptionController::class, 'expiring']);
            Route::post('/subs', [\App\Http\Controllers\Admin\AdminSubscriptionController::class, 'store']);
            Route::patch('/subs/{subscription}/extend', [\App\Http\Controllers\Admin\AdminSubscriptionController::class, 'extend']);
            Route::patch('/subs/{subscription}/cancel', [\App\Http\Controllers\Admin\AdminSubscriptionController::class, 'cancel']);

            // Broadcast
            Route::post('/broadcast', [\App\Http\Controllers\Admin\AdminBroadcastController::class, 'store']);

            // Settings
            Route::get('/settings', [\App\Http\Controllers\Admin\AdminSettingController::class, 'index']);
            Route::post('/settings', [\App\Http\Controllers\Admin\AdminSettingController::class, 'update']);

            // Manual Payments
            Route::get('/manual-payments', [\App\Http\Controllers\Admin\AdminManualPaymentController::class, 'index']);
            Route::post('/manual-payments/{manualPayment}/approve', [\App\Http\Controllers\Admin\AdminManualPaymentController::class, 'approve']);
            Route::post('/manual-payments/{manualPayment}/reject', [\App\Http\Controllers\Admin\AdminManualPaymentController::class, 'reject']);
        });
    });
});
