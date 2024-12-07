import React, { useState } from 'react';
import { Plus, Search, FileDown, Upload, Edit2, Trash2, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, PRODUCT_CATEGORIES, ProductCategory } from '../types';
import { formatRupiah } from '../utils/format';
import EditProductModal from '../components/EditProductModal';
import CategoryFilter from '../components/CategoryFilter';
import * as XLSX from 'xlsx';

export default function Products() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    quantity: '',
    category: PRODUCT_CATEGORIES[0],
    toppings: [] as { name: string; price: number }[]
  });
  const [newTopping, setNewTopping] = useState({ name: '', price: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(product =>
    (selectedCategory === 'all' || product.category === selectedCategory) &&
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;

    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      quantity: Number(newProduct.quantity) || 0,
      toppings: newProduct.toppings
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({ 
      name: '', 
      price: '', 
      quantity: '',
      category: PRODUCT_CATEGORIES[0],
      toppings: []
    });
    setShowNewProductForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddTopping = () => {
    if (!newTopping.name || !newTopping.price) return;
    
    setNewProduct(prev => ({
      ...prev,
      toppings: [
        ...prev.toppings,
        { name: newTopping.name, price: Number(newTopping.price) }
      ]
    }));
    setNewTopping({ name: '', price: '' });
  };

  const handleRemoveTopping = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      toppings: prev.toppings.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedProducts: Product[] = jsonData.map((row: any) => ({
          id: crypto.randomUUID(),
          name: row.name || '',
          category: PRODUCT_CATEGORIES.includes(row.category) ? row.category : PRODUCT_CATEGORIES[0],
          price: Number(row.price) || 0,
          quantity: Number(row.quantity) || 0,
          toppings: []
        }));

        const newProducts = importedProducts.filter(newProduct => 
          !products.some(existingProduct => 
            existingProduct.name.toLowerCase() === newProduct.name.toLowerCase()
          )
        );

        setProducts(prev => [...prev, ...newProducts]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        alert(`Successfully imported ${newProducts.length} new products. ${importedProducts.length - newProducts.length} products were skipped as duplicates.`);
      } catch (error) {
        console.error('Error importing products:', error);
        alert('Failed to import products. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Product',
        category: 'Food',
        price: 25000,
        quantity: 100
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    XLSX.utils.sheet_add_aoa(ws, [
      ['name', 'category', 'price', 'quantity'],
      ['Product Name', 'Food/Beverage/Snack/Other', 'Price in Rupiah', 'Stock Quantity']
    ], { origin: 'A1' });

    if (window.Android?.downloadFile) {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const reader = new FileReader();
      reader.onload = function() {
        const base64data = reader.result as string;
        window.Android.downloadFile(base64data, 'product_import_template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      };
      reader.readAsDataURL(blob);
    } else {
      XLSX.writeFile(wb, 'product_import_template.xlsx');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Product Management</h2>
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1 text-sm"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Template</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 text-sm"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => setShowNewProductForm(true)}
              className="px-2 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {showNewProductForm && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Product</h3>
                <button
                  onClick={() => setShowNewProductForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter initial stock"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional Toppings
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newTopping.name}
                      onChange={(e) => setNewTopping({ ...newTopping, name: e.target.value })}
                      placeholder="Topping name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={newTopping.price}
                      onChange={(e) => setNewTopping({ ...newTopping, price: e.target.value })}
                      placeholder="Price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    onClick={handleAddTopping}
                    disabled={!newTopping.name || !newTopping.price}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Add Topping</span>
                    <Plus className="w-4 h-4 sm:hidden" />
                  </button>
                </div>

                {newProduct.toppings.length > 0 && (
                  <div className="space-y-2">
                    {newProduct.toppings.map((topping, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
                        <span className="text-sm">{topping.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{formatRupiah(topping.price)}</span>
                          <button
                            onClick={() => handleRemoveTopping(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewProductForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={!newProduct.name || !newProduct.price}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Add Product
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-lg font-bold text-green-600">
                  {formatRupiah(product.price)}
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  Stock: {product.quantity} units
                </div>

                {product.toppings && product.toppings.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700">Optional Toppings:</div>
                    <div className="space-y-1 mt-1">
                      {product.toppings.map((topping, index) => (
                        <div key={index} className="text-sm text-gray-600 flex justify-between">
                          <span>{topping.name}</span>
                          <span>{formatRupiah(topping.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(updatedProduct) => {
            setProducts(prev =>
              prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            );
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}