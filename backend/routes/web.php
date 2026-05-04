<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response('ROUTE OK - Laravel répond', 200);
});
