'use client';

import { useState, useEffect } from 'react';
import { Product, Order, ProductTemplates } from '../types/order';

interface OrderEntryProps {
  onSubmit: (order: {
    firstName: string;
    lastName: string;
    products: Record<string, Product>;
    cartNumber: number;
    status?: 'open' | 'waiting';
  }) => void;
  darkMode: boolean;
  orders: Order[];
  productTemplates: ProductTemplates;
}

type BaseProductField = 'name' | 'quantity' | 'selected';
type ProductField = BaseProductField | string;

interface ProductWithSpecs {
  name: string;
  quantity: number;
  selected: boolean;
  specs: Record<string, string>;
}

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

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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
      products: Object.entries(products)
        .filter(([_, product]) => product.selected)
        .reduce((acc, [key, product]) => ({
          ...acc,
          [key]: {
            id: key,
            name: product.name,
            quantity: product.quantity,
            selected: product.selected,
            specs: product.specs
          }
        }), {}),
      cartNumber: selectedCart,
      status: 'open'
    });
    
    // Reset form with template-based products
    setFirstName('');
    setLastName('');
    setSelectedCart(null);
    
    // Reset products based on current templates
    setProducts(Object.entries(productTemplates).reduce((acc, [id, template]) => ({
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
    }), {}));
  };

  const handleProductChange = (productKey: string, field: ProductField, value: boolean | number | string) => {
    setProducts(prev => ({
      ...prev,
      [productKey]: {
        ...prev[productKey],
        ...(field === 'selected' || field === 'quantity' || field === 'name'
          ? { [field]: value }
          : { specs: { ...prev[productKey].specs, [field]: value as string } }
        )
      }
    }));
  };

  const formatSpecName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const applyPreviousOrder = (order: Order) => {
    const newProducts = { ...INITIAL_PRODUCTS };
    Object.entries(order.products).forEach(([key, product]) => {
      if (product.selected) {
        newProducts[key] = {
          name: product.name,
          quantity: 0, // Reset quantity
          selected: true, // Keep selected
          specs: product.specs ? Object.entries(product.specs).reduce((acc, [field, value]) => ({
            ...acc,
            [field]: value.toString()
          }), {}) : {}
        };
      }
    });
    setProducts(newProducts);
    setShowPreviousOrders(false);
  };

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setSelectedCart(null);
    setProducts(Object.entries(productTemplates).reduce((acc, [id, template]) => ({
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
    }), {}));
  };

  const handleSubmitToWaiting = () => {
    if (!firstName || !lastName) {
      alert('Please enter customer name');
      return;
    }

    onSubmit({
      firstName,
      lastName,
      products: Object.entries(products)
        .filter(([_, product]) => product.selected)
        .reduce((acc, [key, product]) => ({
          ...acc,
          [key]: {
            id: key,
            name: product.name,
            quantity: product.quantity,
            selected: product.selected,
            specs: product.specs
          }
        }), {}),
      cartNumber: 0,
      status: 'waiting'
    });
    handleReset();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Customer Information */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-4 py-2 rounded-md text-sm ${
                darkMode 
                  ? 'bg-slate-700 text-slate-200 placeholder-slate-400 border-slate-600' 
                  : 'bg-white text-slate-900 placeholder-slate-500 border-slate-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter first name"
            />
          </div>
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-4 py-2 rounded-md text-sm ${
                darkMode 
                  ? 'bg-slate-700 text-slate-200 placeholder-slate-400 border-slate-600' 
                  : 'bg-white text-slate-900 placeholder-slate-500 border-slate-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter last name"
            />
          </div>
        </div>

        {previousOrders.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowPreviousOrders(!showPreviousOrders)}
              className={`flex items-center gap-2 text-sm ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <ChevronIcon expanded={showPreviousOrders} />
              Previous Orders ({previousOrders.length})
            </button>
            
            {showPreviousOrders && (
              <div className={`mt-2 p-4 rounded-lg ${
                darkMode ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <div className="space-y-4">
                  {previousOrders.map((order) => (
                    <div 
                      key={order.id}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-slate-800' : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className={`text-sm ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {formatDate(order.createdAt)}
                        </div>
                        <button
                          type="button"
                          onClick={() => applyPreviousOrder(order)}
                          className={`text-sm ${
                            darkMode 
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-900'
                          }`}
                        >
                          Apply Products
                        </button>
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {Object.entries(order.products)
                          .filter(([_, product]) => product.selected)
                          .map(([_, product]) => product.name)
                          .join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Products */}
      <div className="mb-6">
        <h3 className={`text-lg font-medium mb-4 ${
          darkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>
          Products
        </h3>
        <div className="space-y-4">
          {Object.entries(products)
            .sort(([a, _], [b, __]) => 
              productTemplates[a].sortOrder - productTemplates[b].sortOrder
            )
            .map(([key, product]) => (
              <div key={key}>
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="checkbox"
                    checked={product.selected}
                    onChange={(e) => handleProductChange(key, 'selected', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {product.name}
                  </span>
                  {product.selected && (
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(key, 'quantity', parseInt(e.target.value) || 0)}
                      min="0"
                      className={`w-20 px-2 py-1 rounded text-sm ${
                        darkMode 
                          ? 'bg-slate-700 text-slate-200 border-slate-600' 
                          : 'bg-white text-slate-900 border-slate-300'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  )}
                </div>
                {product.selected && productTemplates[key].specs.length > 0 && (
                  <div className="ml-8 grid grid-cols-2 gap-4">
                    {productTemplates[key].specs.map((spec) => (
                      <div key={spec} className="space-y-1">
                        <label className={`block text-sm ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {formatSpecName(spec)}
                        </label>
                        <input
                          type="text"
                          value={product.specs[spec] || ''}
                          onChange={(e) => handleProductChange(key, spec, e.target.value)}
                          className={`w-full px-3 py-1 rounded text-sm ${
                            darkMode 
                              ? 'bg-slate-700 text-slate-200 border-slate-600' 
                              : 'bg-white text-slate-900 border-slate-300'
                          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
        <h3 className={`text-lg font-medium mb-4 ${
          darkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>
          Select Cart
        </h3>
        <div className="grid grid-cols-5 gap-4 mb-4">
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setSelectedCart(selectedCart === number ? null : number)}
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
              onClick={() => setSelectedCart(selectedCart === number ? null : number)}
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
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleReset}
          className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
            darkMode
              ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-offset-slate-800'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title="Clear form"
        >
          <TrashIcon />
        </button>
        <button
          type="button"
          onClick={handleSubmitToWaiting}
          className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
            darkMode
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-offset-slate-800'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
          title="Move to waiting"
        >
          <ClockIcon />
        </button>
        <button
          type="submit"
          disabled={selectedCart === null}
          className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-offset-slate-800 disabled:bg-slate-700 disabled:text-slate-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400'
          }`}
        >
          {selectedCart ? `Submit Order to Cart ${selectedCart}` : 'Select a Cart'}
        </button>
      </div>
    </form>
  );
} 