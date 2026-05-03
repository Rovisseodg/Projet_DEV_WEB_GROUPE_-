<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SetupJWT extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jwt:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup JWT authentication for the application';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Setting up JWT Authentication...');

        // Generate JWT secret
        $this->info('Generating JWT secret...');
        Artisan::call('jwt:secret', ['--force' => true]);

        // Clear cache
        $this->info('Clearing cache...');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('route:clear');

        $this->info('JWT setup completed successfully!');
        $this->info('You can now use JWT authentication in your API.');

        return 0;
    }
}