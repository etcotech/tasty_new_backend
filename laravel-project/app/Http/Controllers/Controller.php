<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function getCurrentRestaurant()
    {
        $selectedId = session('selected_restaurant_id');
        
        if ($selectedId) {
            $restaurant = \App\Models\Restaurant::find($selectedId);
            if ($restaurant) return $restaurant;
        }

        $restaurant = \App\Models\Restaurant::first();
        if ($restaurant) {
            session(['selected_restaurant_id' => $restaurant->id]);
        }
        
        return $restaurant;
    }
}
