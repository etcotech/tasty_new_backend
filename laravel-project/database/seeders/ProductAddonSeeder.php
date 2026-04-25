<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductAddonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classicBurger = \App\Models\Product::where('name_en', 'Classic Burger')->first();
        $truffleBurger = \App\Models\Product::where('name_en', 'Truffle Burger')->first();
        $margheritaPizza = \App\Models\Product::where('name_en', 'Margherita Pizza')->first();

        $extraCheese = \App\Models\Addon::where('name_en', 'Extra Cheese')->first();
        $pepsi = \App\Models\Addon::where('name_en', 'Pepsi')->first();
        $sevenUp = \App\Models\Addon::where('name_en', '7up')->first();
        $water = \App\Models\Addon::where('name_en', 'Water')->first();

        if ($classicBurger) {
            $classicBurger->addons()->sync([$extraCheese->id, $pepsi->id, $sevenUp->id, $water->id]);
        }
        if ($truffleBurger) {
            $truffleBurger->addons()->sync([$extraCheese->id, $pepsi->id, $sevenUp->id, $water->id]);
        }
        if ($margheritaPizza) {
            $margheritaPizza->addons()->sync([$extraCheese->id, $pepsi->id, $sevenUp->id]);
        }
    }
}
