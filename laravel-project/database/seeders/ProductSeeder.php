<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $restaurant = \App\Models\Restaurant::where('slug', 'savor')->first();
        if (!$restaurant) return;

        $burgers = \App\Models\Category::where('name_en', 'Burgers')->first();
        $pizzas  = \App\Models\Category::where('name_en', 'Pizzas')->first();
        $drinks  = \App\Models\Category::where('name_en', 'Drinks')->first();

        $products = [
            [
                'cat'            => $burgers,
                'name_ar'        => 'برجر كلاسيك',
                'name_en'        => 'Classic Burger',
                'description_ar' => 'باتي لحم أنجوس 100%، جبن شيدر معتق، بصل مكرمل، مع صلصة البيت بخبز البريوش المحمص.',
                'description_en' => '100% Angus beef patty, aged cheddar, caramelized onions, house sauce on a toasted brioche bun.',
                'price'          => 25,
                'image_path'     => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
            ],
            [
                'cat'            => $burgers,
                'name_ar'        => 'برجر ترفل',
                'name_en'        => 'Truffle Burger',
                'description_ar' => 'لحم أنجوس فاخر، فطر بري، جبن سويسري، مايونيز الكمأة، وأوراق الجرجير الطازجة.',
                'description_en' => 'Angus beef, wild mushrooms, swiss cheese, truffle mayo, fresh baby arugula.',
                'price'          => 32,
                'image_path'     => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80',
            ],
            [
                'cat'            => $pizzas,
                'name_ar'        => 'بيتزا مارجريتا',
                'name_en'        => 'Margherita Pizza',
                'description_ar' => 'صلصة طماطم سان مارزانو، موزاريلا طازجة، ريحان، وزيت زيتون بكر ممتاز.',
                'description_en' => 'San Marzano tomato sauce, fresh mozzarella, basil, extra virgin olive oil.',
                'price'          => 28,
                'image_path'     => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
            ],
            [
                'cat'            => $drinks,
                'name_ar'        => 'بيبسي',
                'name_en'        => 'Pepsi',
                'description_ar' => 'مشروب غازي بارد منعش.',
                'description_en' => 'Ice-cold refreshing cola drink.',
                'price'          => 6,
                'image_path'     => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
            ],
            [
                'cat'            => $drinks,
                'name_ar'        => 'ماء',
                'name_en'        => 'Water',
                'description_ar' => 'مياه معدنية طبيعية.',
                'description_en' => 'Natural mineral water.',
                'price'          => 3,
                'image_path'     => 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
            ],
        ];

        foreach ($products as $p) {
            \App\Models\Product::updateOrCreate(
                ['restaurant_id' => $restaurant->id, 'name_en' => $p['name_en']],
                [
                    'category_id'    => $p['cat']->id,
                    'name_ar'        => $p['name_ar'],
                    'description_ar' => $p['description_ar'],
                    'description_en' => $p['description_en'],
                    'price'          => $p['price'],
                    'image_path'     => $p['image_path'],
                    'is_available'   => true,
                ]
            );
        }
    }
}
