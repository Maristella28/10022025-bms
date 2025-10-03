<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Serve uploaded files
Route::get('/uploads/{path}', function ($path) {
    $filePath = public_path('uploads/' . $path);
    
    if (!file_exists($filePath)) {
        abort(404, 'File not found');
    }
    
    $mimeType = mime_content_type($filePath);
    $fileName = basename($filePath);
    
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        'Cache-Control' => 'public, max-age=3600'
    ]);
})->where('path', '.*');
