<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use App\Models\Restaurant;
use App\Models\Product;

class SystemCheckController extends Controller
{
    public function index()
    {
        $checks = [];

        // 1. APP_ENV
        $checks[] = [
            'label' => 'Environment (APP_ENV)',
            'value' => config('app.env'),
            'status' => config('app.env') === 'production' ? 'success' : 'warning',
            'note' => config('app.env') === 'production' ? 'Running in production mode.' : 'Currently in ' . config('app.env') . ' mode. Change to production for deployment.'
        ];

        // 2. APP_DEBUG
        $checks[] = [
            'label' => 'Debug Mode (APP_DEBUG)',
            'value' => config('app.debug') ? 'ON' : 'OFF',
            'status' => config('app.debug') ? 'danger' : 'success',
            'note' => config('app.debug') ? 'Debug mode should be OFF in production.' : 'Debug mode is correctly disabled.'
        ];

        // 3. APP_URL
        $checks[] = [
            'label' => 'App URL',
            'value' => config('app.url'),
            'status' => config('app.url') !== 'http://localhost' ? 'success' : 'warning',
            'note' => config('app.url') === 'http://localhost' ? 'APP_URL is still localhost.' : 'URL configured.'
        ];

        // 4. Database Connection
        try {
            DB::connection()->getPdo();
            $dbStatus = 'success';
            $dbValue = 'Connected';
            $dbNote = 'Database connection established.';
        } catch (\Exception $e) {
            $dbStatus = 'danger';
            $dbValue = 'Failed';
            $dbNote = 'Could not connect: ' . $e->getMessage();
        }
        $checks[] = [
            'label' => 'Database Connection',
            'value' => $dbValue,
            'status' => $dbStatus,
            'note' => $dbNote
        ];

        // 5. Storage Link
        $storageLinkExists = file_exists(public_path('storage'));
        $checks[] = [
            'label' => 'Storage Link',
            'value' => $storageLinkExists ? 'Exists' : 'Missing',
            'status' => $storageLinkExists ? 'success' : 'danger',
            'note' => $storageLinkExists ? 'Storage link is present.' : 'Run php artisan storage:link'
        ];

        // 6. Public Storage Writable
        $isWritable = is_writable(storage_path('app/public'));
        $checks[] = [
            'label' => 'Storage Writable',
            'value' => $isWritable ? 'Yes' : 'No',
            'status' => $isWritable ? 'success' : 'danger',
            'note' => $isWritable ? 'Public storage is writable.' : 'Check folder permissions.'
        ];

        // 7. Required Tables
        $requiredTables = ['restaurants', 'categories', 'products', 'addons', 'orders'];
        $missingTables = [];
        foreach ($requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                $missingTables[] = $table;
            }
        }
        $checks[] = [
            'label' => 'Database Schema',
            'value' => empty($missingTables) ? 'Complete' : 'Incomplete',
            'status' => empty($missingTables) ? 'success' : 'danger',
            'note' => empty($missingTables) ? 'All required tables exist.' : 'Missing: ' . implode(', ', $missingTables)
        ];

        // 8. n8n Webhook
        $n8nUrl = env('N8N_WEBHOOK_URL');
        $checks[] = [
            'label' => 'n8n Webhook',
            'value' => $n8nUrl ? 'Configured' : 'Not Set',
            'status' => $n8nUrl ? 'success' : 'warning',
            'note' => $n8nUrl ? 'Webhook URL is set.' : 'Automation will not work without N8N_WEBHOOK_URL.'
        ];

        // 9. Restaurant & Tax Config
        $restaurant = Restaurant::first();
        $taxConfigured = $restaurant && $restaurant->tax_percentage > 0;
        $checks[] = [
            'label' => 'Restaurant Config',
            'value' => $restaurant ? 'Exists' : 'No Restaurant',
            'status' => $restaurant ? 'success' : 'danger',
            'note' => $restaurant ? 'Basic restaurant data found.' : 'Create a restaurant first.'
        ];

        $checks[] = [
            'label' => 'Tax Percentage',
            'value' => $restaurant ? $restaurant->tax_percentage . '%' : 'N/A',
            'status' => $taxConfigured ? 'success' : 'warning',
            'note' => $taxConfigured ? 'Tax percentage is set.' : 'Tax is 0% or restaurant missing.'
        ];

        // 10. Product Data
        $productCount = Product::count();
        $checks[] = [
            'label' => 'Products Count',
            'value' => $productCount,
            'status' => $productCount > 0 ? 'success' : 'warning',
            'note' => $productCount > 0 ? 'Catalog has items.' : 'Store is empty.'
        ];

        return Inertia::render('Admin/SystemCheck', [
            'checks' => $checks
        ]);
    }
}
