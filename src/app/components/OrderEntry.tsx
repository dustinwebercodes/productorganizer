'use client';

import { useState, useEffect } from 'react';
import { Product, ProductSpecs, Order, ProductTemplates } from '../types/order';

interface OrderEntryProps {
  onSubmit: (order: {
    firstName: string;
    lastName: string;
    products: Record<string, Product>;
    cartNumber: number;
  }) => void;
  darkMode: boolean;
  orders: Order[];
  productTemplates: ProductTemplates;
}

type ProductWithSpecs = Product & { specs?: Record<string, string> };

const INITIAL_PRODUCTS: Record<string, ProductWithSpecs> = {
  burnPad: { name: 'Burn Pad', quantity: 0, selected: false, specs: {} },
  foamPad: { name: 'Foam Pad', quantity: 0, selected: false, specs: {} },
  bandageHolder: { name: 'Bandage Holder', quantity: 0, selected: false, specs: {} },
  paddockBag: { name: 'Paddock Bag', quantity: 0, selected: false, specs: {} },
  schoolingPad: { name: 'Schooling Pad', quantity: 0, selected: false, specs: {} },
  raincover: { name: 'Raincover', quantity: 0, selected: false, specs: {} },
  blanket: { name: 'Blanket', quantity: 0, selected: false, specs: {} },
  saddle: { name: 'Saddle', quantity: 0, selected: false, specs: {} },
};

type ProductKey = keyof typeof INITIAL_PRODUCTS;

const PRODUCT_SPECS: Record<string, string[]> = {
  burnPad: ['baseColor', 'corduraColor', 'logoColor'],
  foamPad: ['baseColor', 'seatColor', 'trimColor', 'pipingColor', 'wearLeatherColor', 'logoColor'],
  bandageHolder: ['baseColor', 'logoColor', 'grommetColor'],
  paddockBag: ['baseColor', 'handleColor', 'logoColor'],
  schoolingPad: ['baseColor', 'pipingColor', 'logoColor'],
  raincover: ['baseColor', 'logoColor'],
  blanket: ['type', 'baseColor', 'trimColor', 'logoColor'],
  saddle: ['type', 'baseColor', 'stitchColor', 'topAccentColor', 'bottomAccentColor'],
};

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg 
    className={`w-4 h-4 transition-transform ${expanded ? 'transform rotate-90' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CART_COLORS = {
  1: { bg: 'bg-red-500', text: 'text-white' },
  2: { bg: 'bg-white', text: 'text-black border-2 border-black' },
  3: { bg: 'bg-blue-600', text: 'text-white' },
  4: { bg: 'bg-yellow-300', text: 'text-black' },
  5: { bg: 'bg-green-700', text: 'text-white' },
  6: { bg: 'bg-black', text: 'text-yellow-300' },
  7: { bg: 'bg-orange-500', text: 'text-white' },
  8: { bg: 'bg-pink-400', text: 'text-black' },
  9: { bg: 'bg-cyan-400', text: 'text-black' },
  10: { bg: 'bg-purple-600', text: 'text-white' },
} as const;

export default function OrderEntry({ onSubmit, darkMode, orders, productTemplates }: OrderEntryProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCart, setSelectedCart] = useState<number | null>(null);
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);

  // Initialize products state from templates
  const [products, setProducts] = useState<Record<string, ProductWithSpecs>>(() => {
    return Object.entries(productTemplates).reduce((acc, [id, template]) => ({
      ...acc,
      [id]: {
        name: template.name,
        quantity: 0,
        selected: false,
        specs: template.specs.reduce((specs, spec) => ({
          ...specs,
          [spec]: ''
        }), {})
      }
    }), {});
  });

  // Update products when templates change
  useEffect(() => {
    setProducts(prev => {
      const newProducts: Record<string, ProductWithSpecs> = {};
      
      // Add or update products from templates
      Object.entries(productTemplates).forEach(([id, template]) => {
        if (prev[id]) {
          // Keep existing product data but update name and ensure all specs exist
          newProducts[id] = {
            ...prev[id],
            name: template.name,
            specs: {
              ...template.specs.reduce((specs, spec) => ({
                ...specs,
                [spec]: prev[id].specs?.[spec] || ''
              }), {})
            }
          };
        } else {
          // Create new product
          newProducts[id] = {
            name: template.name,
            quantity: 0,
            selected: false,
            specs: template.specs.reduce((specs, spec) => ({
              ...specs,
              [spec]: ''
            }), {})
          };
        }
      });

      return newProducts;
    });
  }, [productTemplates]);

  // Get occupied cart numbers
  const occupiedCarts = orders
    .filter(order => order.status === 'open' && order.cartNumber)
    .map(order => order.cartNumber);

  useEffect(() => {
    if (firstName.trim() && lastName.trim()) {
      const customerOrders = orders
        .filter(order => 
          order.firstName.toLowerCase() === firstName.toLowerCase() &&
          order.lastName.toLowerCase() === lastName.toLowerCase()
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPreviousOrders(customerOrders);
    } else {
      setPreviousOrders([]);
    }
  }, [firstName, lastName, orders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCart === null) {
      alert('Please select a cart');
      return;
    }
    onSubmit({ 
      firstName, 
      lastName, 
      products,
      cartNumber: selectedCart 
    });
    // Reset form
    setFirstName('');
    setLastName('');
    setProducts(INITIAL_PRODUCTS);
    setSelectedCart(null);
  };

  const handleProductChange = (productKey: string, field: string, value: boolean | number | string) => {
    setProducts(prev => ({
      ...prev,
      [productKey]: {
        ...prev[productKey],
        specs: field !== 'selected' && field !== 'quantity' 
          ? { ...prev[productKey].specs, [field]: value as string }
          : prev[productKey].specs,
        [field]: field === 'selected' || field === 'quantity' ? value : prev[productKey][field],
      },
    }));
  };

  const formatSpecName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const applyPreviousOrder = (order: Order) => {
    // Copy products from previous order, but reset quantities
    const newProducts = { ...INITIAL_PRODUCTS };
    Object.entries(order.products).forEach(([key, product]) => {
      if (product.selected) {
        newProducts[key] = {
          ...product,
          quantity: 0, // Reset quantity
          selected: true, // Keep selected
        };
      }
    });
    setProducts(newProducts);
    setShowPreviousOrders(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Customer Information */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="firstName" className={`block text-sm font-medium ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-100' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="lastName" className={`block text-sm font-medium ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-100' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>
        </div>
        
        {/* Lookup Button */}
        <button
          type="button"
          onClick={() => setShowPreviousOrders(true)}
          disabled={!firstName.trim() || !lastName.trim() || previousOrders.length === 0}
          className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            previousOrders.length > 0
              ? darkMode
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-800 disabled:text-slate-600'
                : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-100 disabled:text-slate-400'
              : darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:bg-slate-800 disabled:text-slate-600'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:bg-slate-100 disabled:text-slate-400'
          }`}
        >
          {previousOrders.length > 0 
            ? `View Previous Orders (${previousOrders.length})`
            : 'No Previous Orders'}
        </button>

        {/* Previous Orders Modal */}
        {showPreviousOrders && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-2xl w-full rounded-lg shadow-lg ${
              darkMode ? 'bg-slate-800' : 'bg-white'
            } p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  Previous Orders for {firstName} {lastName}
                </h3>
                <span className={`text-sm ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Showing newest to oldest
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-4">
                {previousOrders.map((order, index) => (
                  <div key={order.id} className={`p-4 rounded-lg ${
                    darkMode ? 'bg-slate-700' : 'bg-slate-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className={`text-sm ${
                        darkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Order Date: {formatDate(order.createdAt)}
                      </div>
                      <div className={`text-sm font-medium ${
                        index === 0 
                          ? darkMode ? 'text-green-400' : 'text-green-600'
                          : darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {index === 0 ? 'Most Recent Order' : `Order #${previousOrders.length - index}`}
                      </div>
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-slate-200' : 'text-slate-900'
                    } space-y-1`}>
                      {Object.entries(order.products)
                        .filter(([_, product]) => product.selected)
                        .map(([key, product]) => (
                          <div key={key}>
                            <div className="font-medium">{product.name}</div>
                            {product.specs && (
                              <div className="pl-4 text-xs">
                                {Object.entries(product.specs).map(([spec, value]) => (
                                  <div key={spec}>
                                    {formatSpecName(spec)}: {value}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={() => applyPreviousOrder(order)}
                      className={`mt-4 py-2 px-4 rounded-md text-sm ${
                        darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Use These Specs
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreviousOrders(false)}
                  className={`py-2 px-4 rounded-md text-sm ${
                    darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>Custom Products</h3>
        <div className="space-y-4">
          {Object.entries(products)
            .sort(([idA, _a], [idB, _b]) => 
              (productTemplates[idA]?.sortOrder ?? 0) - (productTemplates[idB]?.sortOrder ?? 0)
            )
            .map(([key, product]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleProductChange(key, 'selected', !product.selected)}
                    className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'text-slate-400 hover:text-slate-300' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <ChevronIcon expanded={product.selected} />
                  </button>
                  <label
                    htmlFor={key}
                    className={`flex-1 ${
                      product.selected
                        ? darkMode ? 'text-slate-200' : 'text-slate-900'
                        : darkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {product.name}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(key, 'quantity', parseInt(e.target.value) || 0)}
                    disabled={!product.selected}
                    className={`w-16 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Qty"
                  />
                </div>
                
                {/* Product Specs */}
                {product.selected && product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="ml-8 pl-4 border-l-2 border-slate-200 space-y-2">
                    {Object.entries(product.specs).map(([spec, value]) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <label htmlFor={`${key}-${spec}`} className={`text-sm flex-1 ${
                          darkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {formatSpecName(spec)}
                        </label>
                        <input
                          type="text"
                          id={`${key}-${spec}`}
                          value={value}
                          onChange={(e) => handleProductChange(key, spec, e.target.value)}
                          className={`w-32 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${
                            darkMode 
                              ? 'bg-slate-700 border-slate-600 text-slate-100' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Cart Selection */}
      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>Select Cart</h3>
        <div className="grid grid-cols-5 gap-4 mb-4">
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setSelectedCart(number)}
              disabled={occupiedCarts.includes(number)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-lg font-semibold
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  occupiedCarts.includes(number)
                    ? `${CART_COLORS[number as keyof typeof CART_COLORS].bg} ${CART_COLORS[number as keyof typeof CART_COLORS].text} cursor-not-allowed`
                    : selectedCart === number
                    ? `${CART_COLORS[number as keyof typeof CART_COLORS].bg} ${CART_COLORS[number as keyof typeof CART_COLORS].text}`
                    : darkMode
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }
              `}
            >
              {number}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[6, 7, 8, 9, 10].map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setSelectedCart(number)}
              disabled={occupiedCarts.includes(number)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-lg font-semibold
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  occupiedCarts.includes(number)
                    ? `${CART_COLORS[number as keyof typeof CART_COLORS].bg} ${CART_COLORS[number as keyof typeof CART_COLORS].text} cursor-not-allowed`
                    : selectedCart === number
                    ? `${CART_COLORS[number as keyof typeof CART_COLORS].bg} ${CART_COLORS[number as keyof typeof CART_COLORS].text}`
                    : darkMode
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }
              `}
            >
              {number}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={selectedCart === null}
        className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          darkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-offset-slate-800 disabled:bg-slate-700 disabled:text-slate-500'
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400'
        }`}
      >
        {selectedCart ? `Submit Order to Cart ${selectedCart}` : 'Select a Cart'}
      </button>
    </form>
  );
} 