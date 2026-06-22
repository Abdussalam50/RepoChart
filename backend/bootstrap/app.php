<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Disabled statefulApi() because the frontend uses stateless Bearer token authentication,
        // which does not require (and will fail) CSRF checks.
        // $middleware->statefulApi();

        // Register middleware alias for premium plan check and admin
        $middleware->alias([
            'premium'  => \App\Http\Middleware\EnsurePremiumPlan::class,
            'is_admin' => \App\Http\Middleware\IsAdmin::class,
        ]);

        // CORS: Allow frontend origins
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Log all exceptions with context
        $exceptions->report(function (Throwable $e) {
            // Don't log NotFoundHttpException (too noisy)
            if ($e instanceof NotFoundHttpException) {
                return false;
            }

            Log::error('Application Exception', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'url' => request()->getPathInfo(),
                'method' => request()->getMethod(),
                'user_id' => auth()->id(),
            ]);

            return false;
        });

        // Return JSON for API routes when resource not found
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error'   => 'Resource tidak ditemukan.',
                    'message' => $e->getMessage(),
                ], 404);
            }
        });

        // Return JSON for API validation errors
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                Log::warning('Validation error', [
                    'url' => $request->getPathInfo(),
                    'errors' => $e->errors(),
                    'user_id' => auth()->id(),
                ]);

                return response()->json([
                    'error' => 'Validation gagal',
                    'messages' => $e->errors(),
                ], 422);
            }
        });
    })->create();
