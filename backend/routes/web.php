<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    $file = public_path('index.html');
    if (file_exists($file)) {
        return response()->file($file);
    }
    return response('Page non trouvée', 404);
})->where('any', '^(?!api).*');
