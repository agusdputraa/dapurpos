import React, { useState, useRef, useEffect } from 'react';
import { X, FileDown, Upload, ShoppingCart, RotateCcw, Truck, Search, Plus, Minus, MessageCircle } from 'lucide-react';
import { formatRupiah } from '../utils/format';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, CartItem, Denomination, ProductCategory, PRODUCT_CATEGORIES } from '../types';
import CategoryFilter from './CategoryFilter';

interface OrderModalProps {
  onClose: () => void;
  onComplete: (total: number, items: CartItem[], shippingAddress?: string, shippingAmount?: number) => void;
  denominations?: Denomination[];
  existingItems?: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    selectedToppings?: { name: string; price: number }[];
    notes?: string;
  }[];
  existingShippingAddress?: string;
  existingShippingAmount?: number;
}

export default function OrderModal({ 
  onClose, 
  onComplete, 
  denominations = [],
  existingItems,
  existingShippingAddress,
  existingShippingAmount
}: OrderModalProps) {
  const [products] = useLocalStorage<Product[]>('products', []);
  const [cart, setCart] = useLocalStorage<CartItem[]>('pending_cart', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [includeShipping, setIncludeShipping] = useState(!!existingShippingAddress || !!existingShippingAmount);
  const [shippingAmount, setShippingAmount] = useState(existingShippingAmount?.toString() || '');
  const [shippingAddress, setShippingAddress] = useState(existingShippingAddress || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingItems) {
      const cartItems: CartItem[] = existingItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        
        return {
          ...product,
          id: item.productId,
          orderQuantity: item.quantity,
          selectedToppings: item.selectedToppings || [],
          notes: item.notes || '',
          instanceId: crypto.randomUUID()
        };
      }).filter((item): item is CartItem => item !== null);

      setCart(cartItems);
    }
  }, [existingItems]);

  const resetCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
    }
  };

  const filteredProducts = products.filter(product =>
    (selectedCategory === 'all' || product.category === selectedCategory) &&
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const newCartItem: CartItem = {
      ...product,
      orderQuantity: 1,
      selectedToppings: [],
      notes: '',
      instanceId: crypto.randomUUID()
    };
    setCart(prev => [...prev, newCartItem]);
  };

  const updateCartItemQuantity = (instanceId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.instanceId !== instanceId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.instanceId === instanceId ? { ...item, orderQuantity: quantity } : item
        )
      );
    }
  };

  const updateCartItemNotes = (instanceId: string, notes: string) => {
    setCart(prev =>
      prev.map(item =>
        item.instanceId === instanceId ? { ...item, notes } : item
      )
    );
  };

  const toggleTopping = (instanceId: string, topping: { name: string; price: number }) => {
    setCart(prev =>
      prev.map(item => {
        if (item.instanceId !== instanceId) return item;

        const hasTopping = item.selectedToppings?.some(t => 
          t.name === topping.name && t.price === topping.price
        );

        return {
          ...item,
          selectedToppings: hasTopping
            ? item.selectedToppings?.filter(t => 
                t.name !== topping.name || t.price !== topping.price
              )
            : [...(item.selectedToppings || []), topping]
        };
      })
    );
  };

  const getItemTotal = (item: CartItem) => {
    const toppingsTotal = item.selectedToppings?.reduce(
      (sum, topping) => sum + topping.price,
      0
    ) || 0;
    return (item.price + toppingsTotal) * item.orderQuantity;
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  const getShippingTotal = () => {
    return includeShipping ? Number(shippingAmount) || 0 : 0;
  };

  const getTotal = () => {
    return getSubtotal() + getShippingTotal();
  };

  const handleComplete = () => {
    const total = getTotal();
    if (total > 0) {
      onComplete(
        total,
        cart.map(item => ({
          ...item,
          notes: item.notes?.trim() || ''
        })),
        includeShipping ? shippingAddress : undefined,
        includeShipping ? Number(shippingAmount) : undefined
      );
      setCart([]);
    }
  };

  const groupedCartItems = cart.reduce((groups: { [key: string]: CartItem[] }, item) => {
    if (!groups[item.id]) {
      groups[item.id] = [];
    }
    groups[item.id].push(item);
    return groups;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl my-8">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold">Add Items</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-4 border-r">
            <div className="sticky top-[73px] bg-white pb-4 z-10 space-y-4">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg text-sm"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatRupiah(product.price)}
                        {product.quantity > 0 && ` · ${product.quantity} in stock`}
                      </div>
                      {product.toppings && product.toppings.length > 0 && (
                        <div className="mt-1 text-sm text-gray-500">
                          Optional toppings available
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      disabled={product.quantity === 0}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 p-4">
            <div className="sticky top-[73px] bg-white z-10">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <h4 className="font-semibold">Cart</h4>
                </div>
                <button
                  onClick={resetCart}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Cart
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-400px)] overflow-y-auto border rounded-lg mb-4">
              {cart.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Cart is empty
                </div>
              ) : (
                <div className="divide-y">
                  {Object.entries(groupedCartItems).map(([productId, items]) => (
                    <div key={productId} className="p-4 hover:bg-gray-50">
                      <div className="font-medium mb-2">{items[0].name}</div>
                      {items.map((item) => (
                        <div key={item.instanceId} className="ml-4 mb-4 last:mb-0">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-600">
                              Item #{items.indexOf(item) + 1}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartItemQuantity(item.instanceId, item.orderQuantity - 1)}
                                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center">{item.orderQuantity}</span>
                              <button
                                onClick={() => updateCartItemQuantity(item.instanceId, item.orderQuantity + 1)}
                                className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateCartItemQuantity(item.instanceId, 0)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="relative mb-2">
                            <input
                              type="text"
                              placeholder="Add notes (optional)"
                              value={item.notes || ''}
                              onChange={(e) => updateCartItemNotes(item.instanceId, e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                              maxLength={100}
                            />
                            <MessageCircle className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                              {(item.notes?.length || 0)}/100
                            </div>
                          </div>

                          {item.toppings && item.toppings.length > 0 && (
                            <div className="mt-2 space-y-2">
                              <div className="text-sm font-medium text-gray-700">Toppings:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {item.toppings.map((topping, toppingIndex) => (
                                  <button
                                    key={toppingIndex}
                                    onClick={() => toggleTopping(item.instanceId, topping)}
                                    className={`px-2 py-1 text-sm rounded-lg text-left flex justify-between items-center ${
                                      item.selectedToppings?.some(t => 
                                        t.name === topping.name && t.price === topping.price
                                      )
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    <span>{topping.name}</span>
                                    <span>{formatRupiah(topping.price)}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-2 text-sm text-gray-600">
                            Item total: {formatRupiah(getItemTotal(item))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  id="includeShipping"
                  checked={includeShipping}
                  onChange={(e) => setIncludeShipping(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="includeShipping" className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Include Shipping
                </label>
              </div>

              {includeShipping && (
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Shipping Amount"
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <textarea
                    placeholder="Shipping Address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatRupiah(getSubtotal())}</span>
                </div>
                {includeShipping && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{formatRupiah(getShippingTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold text-green-600 pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatRupiah(getTotal())}</span>
                </div>
              </div>

              <button
                onClick={handleComplete}
                disabled={cart.length === 0}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}