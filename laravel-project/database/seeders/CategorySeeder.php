<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurant = \App\Models\Restaurant::where('slug', 'savor')->first();
        if (!$restaurant) return;

        $categories = [
            ['name_ar' => 'برجر', 'name_en' => 'Burgers'],
            ['name_ar' => 'بيتزا', 'name_en' => 'Pizzas'],
            ['name_ar' => 'مشروبات', 'name_en' => 'Drinks'],
        ];

        foreach ($categories as $cat) {
            \App\Models\Category::updateOrCreate(
                ['restaurant_id' => $restaurant->id, 'name_en' => $cat['name_en']],
                ['name_ar' => $cat['name_ar'], 'is_active' => true]
            );
        }
    }
}
