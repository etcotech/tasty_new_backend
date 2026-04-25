<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $addons = [
            ['name_ar' => 'جبنة إضافية', 'name_en' => 'Extra Cheese', 'price' => 3],
            ['name_ar' => 'بيبسي', 'name_en' => 'Pepsi', 'price' => 6],
            ['name_ar' => 'سفن أب', 'name_en' => '7up', 'price' => 6],
            ['name_ar' => 'ماء', 'name_en' => 'Water', 'price' => 3],
        ];

        foreach ($addons as $addon) {
            \App\Models\Addon::updateOrCreate(
                ['name_en' => $addon['name_en']],
                ['name_ar' => $addon['name_ar'], 'price' => $addon['price'], 'is_active' => true]
            );
        }
    }
}
