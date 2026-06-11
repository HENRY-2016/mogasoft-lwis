<?php

use App\Http\Controllers\SeederController;
use Illuminate\Support\Facades\Route;


use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Artisan;

// Database Management Routes
Route::get('/migrate', function(){
    Artisan::call('migrate', ['--force' => true]);
    return 'Migrations Done!';
});

Route::get('/migrate-fresh', function(){
    Artisan::call('migrate:fresh', ['--force' => true]);
    return 'Fresh migrations completed!';
});

Route::get('/migrate-refresh', function(){
    Artisan::call('migrate:refresh', ['--force' => true]);
    return 'Migrations refreshed!';
});

// Cache Management Routes
Route::get('/config-cache', function() {
    Artisan::call('config:cache');
    return 'Config cache cleared';
});

Route::get('/clear-cache', function() {
    Artisan::call('cache:clear');
    return 'Application cache cleared';
});

Route::get('/view-clear', function() {
    Artisan::call('view:clear');
    return 'View cache cleared';
});

Route::get('/route-cache', function() {
    Artisan::call('route:cache');
    return 'Routes cache cleared';
});

Route::get('/clear-all', function() {
    Artisan::call('cache:clear');
    Artisan::call('view:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    return 'All caches cleared!';
});

Route::get('/', function () {
    return File::get(public_path('app/index.html'));
});

Route::get('/static/{any}', function ($path) {
    $fullPath = public_path("app/static/{$path}");

    if (!File::exists($fullPath)) {
        abort(404);
    }

    // Determine MIME type based on file extension
    $mimeTypes = [
        'js' => 'application/javascript',
        'css' => 'text/css',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject'
    ];

    $extension = pathinfo($fullPath, PATHINFO_EXTENSION);
    $contentType = $mimeTypes[$extension] ?? 'text/plain';

    return Response::file($fullPath, [
        'Content-Type' => $contentType
    ]);
})->where('any', '.*');

Route::get('/{any}', function () {
    return File::get(public_path('app/index.html'));
})->where('any', '^(?!api|static).*$');

