<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Addon;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Products', [
            'products' => Product::with(['category', 'addons'])->get(),
            'categories' => Category::all(),
            'extras' => Addon::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image_path' => 'nullable|string',
            'extra_ids' => 'nullable|array',
            'extra_ids.*' => 'exists:addons,id'
        ]);

        $restaurant = Restaurant::first();

        $product = Product::create(array_merge($request->all(), [
            'restaurant_id' => $restaurant->id
        ]));

        if ($request->has('extra_ids')) {
            $product->addons()->sync($request->extra_ids);
        }

        return redirect()->back()->with('message', 'Product created successfully');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image_path' => 'nullable|string',
            'extra_ids' => 'nullable|array',
            'extra_ids.*' => 'exists:addons,id'
        ]);

        $product->update($request->all());

        if ($request->has('extra_ids')) {
            $product->addons()->sync($request->extra_ids);
        }

        return redirect()->back()->with('message', 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back()->with('message', 'Product deleted successfully');
    }

    public function exportTemplate()
    {
        $headers = [
            'category_ar', 'category_en', 'name_ar', 'name_en', 
            'description_ar', 'description_en', 'price', 
            'image_path', 'is_available'
        ];

        $callback = function() use ($headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=products_template.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ]);
    }

    public function export()
    {
        $products = Product::with('category')->get();
        $headers = [
            'category_ar', 'category_en', 'name_ar', 'name_en', 
            'description_ar', 'description_en', 'price', 
            'image_path', 'is_available'
        ];

        $callback = function() use ($products, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            foreach ($products as $product) {
                fputcsv($file, [
                    $product->category->name_ar ?? '',
                    $product->category->name_en ?? '',
                    $product->name_ar,
                    $product->name_en,
                    $product->description_ar,
                    $product->description_en,
                    $product->price,
                    $product->image_path,
                    $product->is_available ? '1' : '0',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=products_export.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = fopen($request->file('file')->getRealPath(), 'r');
        $headers = fgetcsv($file);
        
        $restaurant = Restaurant::first();

        while (($row = fgetcsv($file)) !== false) {
            if (count($row) < 7) continue;

            $data = array_combine($headers, $row);

            // Find or create category
            $category = Category::firstOrCreate(
                ['name_ar' => $data['category_ar']],
                ['name_en' => $data['category_en']]
            );

            // Create or update product
            Product::updateOrCreate(
                [
                    'name_ar' => $data['name_ar'],
                    'category_id' => $category->id
                ],
                [
                    'restaurant_id' => $restaurant->id,
                    'name_en' => $data['name_en'],
                    'description_ar' => $data['description_ar'] ?? '',
                    'description_en' => $data['description_en'] ?? '',
                    'price' => $data['price'],
                    'image_path' => $data['image_path'] ?? '',
                    'is_available' => $data['is_available'] ?? 1
                ]
            );
        }

        fclose($file);

        return redirect()->back()->with('message', 'Products imported successfully');
    }
}
