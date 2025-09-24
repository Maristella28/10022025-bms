<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\DocumentRequest;
use App\Observers\DocumentRequestObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Register model observers
        DocumentRequest::observe(DocumentRequestObserver::class);
    }
}
