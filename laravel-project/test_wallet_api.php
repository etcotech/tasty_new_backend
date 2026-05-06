<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\WalletController;
use Illuminate\Http\Request;

$slug = 'tasty';
$phone = '966543798662';

$request = Request::create("/api/$slug/wallet", 'GET', ['phone' => $phone]);
$controller = new WalletController();
$response = $controller->getBalance($request, $slug);

header('Content-Type: application/json');
echo $response->getContent();
