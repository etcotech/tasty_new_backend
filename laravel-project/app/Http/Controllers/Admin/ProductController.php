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

        $callback = function() {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel
            fwrite($file, "\xEF\xBB\xBF");
            
            $headers = [
                'category_ar', 'category_en', 'name_ar', 'name_en', 
                'description_ar', 'description_en', 'price', 
                'image_path', 'is_available'
            ];
            
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

        $callback = function() use ($products) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel
            fwrite($file, "\xEF\xBB\xBF");

            $headers = [
                'category_ar', 'category_en', 'name_ar', 'name_en', 
                'description_ar', 'description_en', 'price', 
                'image_path', 'is_available'
            ];
            
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

        $path = $request->file('file')->getRealPath();
        $content = file_get_contents($path);

        // Detect and convert encoding
        $encoding = mb_detect_encoding($content, ['UTF-8', 'ISO-8859-6'], true);
        
        if ($encoding === 'ISO-8859-6') {
            $content = mb_convert_encoding($content, 'UTF-8', 'ISO-8859-6');
        } elseif (!$encoding) {
            // If not detected as UTF-8 or ISO-8859-6, try CP1256 fallback
            try {
                $converted = @mb_convert_encoding($content, 'UTF-8', 'CP1256');
                if ($converted !== false) {
                    $content = $converted;
                }
            } catch (\Throwable $e) {
                // Fallback to original content
            }
        }

        // Strip UTF-8 BOM if present
        $bom = "\xEF\xBB\xBF";
        if (substr($content, 0, 3) === $bom) {
            $content = substr($content, 3);
        }

        // Use temporary stream to parse CSV
        $temp = fopen('php://temp', 'r+');
        fwrite($temp, $content);
        rewind($temp);

        $headers = fgetcsv($temp);
        
        if (!$headers) {
            fclose($temp);
            return redirect()->back()->withErrors(['file' => 'The CSV file is empty or invalid.']);
        }

        // Normalize headers: trim and lowercase
        $headers = array_map(function($h) {
            return strtolower(trim($h));
        }, $headers);

        // Required columns validation
        $required = ['category_ar', 'name_ar', 'price'];
        foreach ($required as $col) {
            if (!in_array($col, $headers)) {
                fclose($temp);
                return redirect()->back()->withErrors(['file' => "Required column '$col' is missing. Please check the template."]);
            }
        }

        $restaurant = Restaurant::first();

        while (($row = fgetcsv($temp)) !== false) {
            if (empty($row) || count($row) < count($headers)) continue;

            $data = array_combine($headers, $row);
            
            // Basic data cleaning
            $data = array_map('trim', $data);

            if (empty($data['category_ar']) || empty($data['name_ar'])) continue;

            // Find or create category
            $category = Category::firstOrCreate(
                ['name_ar' => $data['category_ar']],
                ['name_en' => $data['category_en'] ?? $data['category_ar']]
            );

            // Create or update product
            Product::updateOrCreate(
                [
                    'name_ar' => $data['name_ar'],
                    'category_id' => $category->id
                ],
                [
                    'restaurant_id' => $restaurant->id,
                    'name_en' => $data['name_en'] ?? $data['name_ar'],
                    'description_ar' => $data['description_ar'] ?? '',
                    'description_en' => $data['description_en'] ?? '',
                    'price' => (float)$data['price'],
                    'image_path' => $data['image_path'] ?? '',
                    'is_available' => isset($data['is_available']) ? (int)$data['is_available'] : 1
                ]
            );
        }

        fclose($temp);

        return redirect()->back()->with('message', 'Products imported successfully');
    }
}
