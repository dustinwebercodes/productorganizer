'use client';

import { useState } from 'react';
import { Order, Product, ProductTemplates } from '../types/order';

interface EditProductsModalProps {
  order: Order;
  darkMode: boolean;
  onClose: () => void;
  onSave: (products: Record<string, Product>) => void;
  productTemplates: ProductTemplates;
}

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

export default function EditProductsModal({ 
  order, 
  darkMode, 
  onClose, 
  onSave,
  productTemplates 
}: EditProductsModalProps) {
  const [products, setProducts] = useState<Record<string, Product>>(order.products);

  const handleProductChange = (
    productKey: string, 
    field: string, 
    value: boolean | number | string
  ) => {
    setProducts(prev => ({
      ...prev,
      [productKey]: {
        ...prev[productKey],
        ...(field === 'selected' || field === 'quantity'
          ? { [field]: value }
          : { specs: { ...prev[productKey].specs, [field]: value as string } }
        )
      }
    }));
  };

  const formatSpecName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-2xl w-full rounded-lg shadow-lg ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      } p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-slate-200' : 'text-slate-800'
          }`}>
            Edit Products for {order.firstName} {order.lastName}
          </h3>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
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
                  <label className={`flex-1 ${
                    product.selected
                      ? darkMode ? 'text-slate-200' : 'text-slate-900'
                      : darkMode ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    {product.name}
                  </label>
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(key, 'quantity', parseInt(e.target.value) || 0)}
                    disabled={!product.selected}
                    className={`w-16 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-center ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    min="0"
                  />
                </div>

                {product.selected && product.specs && (
                  <div className="ml-8 pl-4 border-l-2 border-slate-200 space-y-2">
                    {Object.entries(product.specs).map(([spec, value]) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <label className={`text-sm flex-1 ${
                          darkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {formatSpecName(spec)}
                        </label>
                        <input
                          type="text"
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

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(products)}
            className={`px-4 py-2 rounded-md text-sm ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 