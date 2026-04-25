<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Restaurant::updateOrCreate(
            ['slug' => 'savor'],
            [
                'name_ar'   => 'سافور',
                'name_en'   => 'SAVOR',
                'logo_path' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
                'is_active' => true,
            ]
        );
    }
}
