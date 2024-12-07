import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product, PRODUCT_CATEGORIES } from '../types';
import { formatRupiah } from '../utils/format';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export default function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const [newTopping, setNewTopping] = useState({ name: '', price: '' });

  const handleAddTopping = () => {
    if (!newTopping.name || !newTopping.price) return;
    
    setEditedProduct(prev => ({
      ...prev,
      toppings: [
        ...(prev.toppings || []),
        { name: newTopping.name, price: Number(newTopping.price) }
      ]
    }));
    setNewTopping({ name: '', price: '' });
  };

  const removeTopping = (index: number) => {
    setEditedProduct(prev => ({
      ...prev,
      toppings: prev.toppings?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = () => {
    if (!editedProduct.name || editedProduct.price <= 0) return;
    onSave(editedProduct);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Edit Product</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={editedProduct.category}
              onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              value={editedProduct.price}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input
              type="number"
              value={editedProduct.quantity}
              onChange={(e) => setEditedProduct({ ...editedProduct, quantity: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">Optional Toppings</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Topping name"
                  value={newTopping.name}
                  onChange={(e) => setNewTopping({ ...newTopping, name: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newTopping.price}
                  onChange={(e) => setNewTopping({ ...newTopping, price: e.target.value })}
                  className="w-24 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={handleAddTopping}
                  disabled={!newTopping.name || !newTopping.price}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {editedProduct.toppings && editedProduct.toppings.length > 0 && (
                <div className="space-y-2">
                  {editedProduct.toppings.map((topping, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm">{topping.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{formatRupiah(topping.price)}</span>
                        <button
                          onClick={() => removeTopping(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}