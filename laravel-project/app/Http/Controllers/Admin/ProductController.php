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
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        return Inertia::render('Admin/Products', [
            'products' => Product::where('restaurant_id', $restaurant->id)->with(['category', 'addons', 'branches'])->get(),
            'categories' => Category::where('restaurant_id', $restaurant->id)->get(),
            'extras' => Addon::where('restaurant_id', $restaurant->id)->get(),
            'branches' => $restaurant->branches()->get(['id', 'name_ar', 'name_en'])
        ]);
    }

    public function store(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        $request->validate([
            'category_id'    => 'required|exists:categories,id',
            'name_ar'        => 'required|string|max:255',
            'name_en'        => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price'          => 'required|numeric|min:0',
            'image_path'     => 'nullable|string',
            'is_available'   => 'boolean',
            'available_all_branches' => 'boolean',
            'branch_ids'     => 'nullable|array',
            'branch_ids.*'   => 'exists:branches,id',
            'extra_ids'      => 'nullable|array',
            'extra_ids.*'    => 'exists:addons,id'
        ]);

        $product = Product::create(array_merge($request->all(), [
            'restaurant_id' => $restaurant->id,
            'is_available'  => $request->boolean('is_available', true),
            'available_all_branches' => $request->boolean('available_all_branches', true)
        ]));

        if (!$product->available_all_branches && $request->has('branch_ids')) {
            $product->branches()->sync($request->branch_ids);
        }

        if ($request->has('extra_ids')) {
            $product->addons()->sync($request->extra_ids);
        }

        return redirect()->back()->with('message', 'تم إضافة المنتج بنجاح');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'category_id'    => 'required|exists:categories,id',
            'name_ar'        => 'required|string|max:255',
            'name_en'        => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price'          => 'required|numeric|min:0',
            'image_path'     => 'nullable|string',
            'is_available'   => 'boolean',
            'available_all_branches' => 'boolean',
            'branch_ids'     => 'nullable|array',
            'branch_ids.*'   => 'exists:branches,id',
            'extra_ids'      => 'nullable|array',
            'extra_ids.*'    => 'exists:addons,id'
        ]);

        $product->update(array_merge($request->all(), [
            'is_available' => $request->boolean('is_available'),
            'available_all_branches' => $request->boolean('available_all_branches')
        ]));

        if ($product->available_all_branches) {
            $product->branches()->detach();
        } elseif ($request->has('branch_ids')) {
            $product->branches()->sync($request->branch_ids);
        }

        if ($request->has('extra_ids')) {
            $product->addons()->sync($request->extra_ids);
        }

        return redirect()->back()->with('message', 'تم تحديث المنتج بنجاح');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back()->with('message', 'Product deleted successfully');
    }

    public function exportTemplate()
    {
        $callback = function() {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");
            
            $headers = [
                'category_ar', 'category_en', 'name_ar', 'name_en', 
                'description_ar', 'description_en', 'price', 
                'image_path', 'is_available', 'available_all_branches', 'branch_names'
            ];
            
            fputcsv($file, $headers);
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=products_template.csv"
        ]);
    }

    public function export()
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        $products = Product::where('restaurant_id', $restaurant->id)->with(['category', 'branches'])->get();
        
        $callback = function() use ($products) {
            $file = fopen('php://output', 'w');
            fwrite($file, "\xEF\xBB\xBF");

            $headers = [
                'category_ar', 'category_en', 'name_ar', 'name_en', 
                'description_ar', 'description_en', 'price', 
                'image_path', 'is_available', 'available_all_branches', 'branch_names'
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
                    $product->available_all_branches ? '1' : '0',
                    $product->branches->pluck('name_ar')->implode('|'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=products_export.csv"
        ]);
    }

    public function import(Request $request)
    {
        $restaurant = $this->getCurrentRestaurant();
        if (!$restaurant) {
            return redirect()->route('admin.restaurants.index');
        }

        $request->validate(['file' => 'required|file|mimes:csv,txt']);

        $path = $request->file('file')->getRealPath();
        $content = file_get_contents($path);

        // Encoding handle...
        $encoding = mb_detect_encoding($content, ['UTF-8', 'ISO-8859-6'], true);
        if ($encoding === 'ISO-8859-6') $content = mb_convert_encoding($content, 'UTF-8', 'ISO-8859-6');

        $bom = "\xEF\xBB\xBF";
        if (substr($content, 0, 3) === $bom) $content = substr($content, 3);

        $temp = fopen('php://temp', 'r+');
        fwrite($temp, $content);
        rewind($temp);

        $headers = fgetcsv($temp);
        if (!$headers) { fclose($temp); return back()->withErrors(['file' => 'Invalid CSV']); }

        $headers = array_map(function($h) { return strtolower(trim($h)); }, $headers);
        
        while (($row = fgetcsv($temp)) !== false) {
            if (empty($row) || count($row) < 3) continue;
            $data = array_combine(array_slice($headers, 0, count($row)), $row);
            $data = array_map('trim', $data);

            if (empty($data['category_ar']) || empty($data['name_ar'])) continue;

            $category = Category::firstOrCreate(
                ['restaurant_id' => $restaurant->id, 'name_ar' => $data['category_ar']],
                ['name_en' => $data['category_en'] ?? $data['category_ar']]
            );

            $product = Product::updateOrCreate(
                ['restaurant_id' => $restaurant->id, 'name_ar' => $data['name_ar'], 'category_id' => $category->id],
                [
                    'name_en' => $data['name_en'] ?? $data['name_ar'],
                    'description_ar' => $data['description_ar'] ?? '',
                    'description_en' => $data['description_en'] ?? '',
                    'price' => (float)$data['price'],
                    'image_path' => $data['image_path'] ?? '',
                    'is_available' => isset($data['is_available']) ? (int)$data['is_available'] : 1,
                    'available_all_branches' => isset($data['available_all_branches']) ? (int)$data['available_all_branches'] : 1,
                ]
            );

            if (!$product->available_all_branches && !empty($data['branch_names'])) {
                $branchNames = explode('|', $data['branch_names']);
                $branchIds = \App\Models\Branch::where('restaurant_id', $restaurant->id)
                    ->whereIn('name_ar', $branchNames)
                    ->pluck('id');
                $product->branches()->sync($branchIds);
            } else {
                $product->branches()->detach();
            }
        }
        fclose($temp);
        return back()->with('message', 'Products imported successfully');
    }
}
