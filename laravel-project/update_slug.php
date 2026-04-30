<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Restaurant;

$r = Restaurant::where('slug', 'savor')->first();
if($r) {
    $r->update(['slug' => 'tasty', 'name' => 'مطعم تيستي التجريبي']);
    echo "Updated savor to tasty\n";
} else {
    echo "Savor not found or already tasty\n";
}
