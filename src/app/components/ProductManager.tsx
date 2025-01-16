'use client';

import { useState } from 'react';
import { ProductTemplate, ProductTemplates } from '../types/order';

interface ProductManagerProps {
  darkMode: boolean;
  onClose: () => void;
  initialProducts: ProductTemplates;
  onSave: (products: ProductTemplates) => void;
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg 
    className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function ProductManager({ darkMode, onClose, initialProducts, onSave }: ProductManagerProps) {
  const [products, setProducts] = useState<ProductTemplates>(initialProducts);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [newSpecName, setNewSpecName] = useState('');

  const addProduct = () => {
    const id = Date.now().toString();
    setProducts(prev => ({
      ...prev,
      [id]: {
        id,
        name: 'New Product',
        specs: [],
        sortOrder: Object.keys(prev).length
      }
    }));
    setExpandedProduct(id);
  };

  const deleteProduct = (id: string) => {
    const newProducts = { ...products };
    delete newProducts[id];
    setProducts(newProducts);
  };

  const updateProduct = (id: string, updates: Partial<ProductTemplate>) => {
    setProducts(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const addSpec = (productId: string) => {
    if (!newSpecName.trim()) return;
    
    const specName = newSpecName
      .trim()
      .replace(/\s+/g, '')
      .replace(/^./, str => str.toLowerCase());

    updateProduct(productId, {
      specs: [...products[productId].specs, specName]
    });
    setNewSpecName('');
  };

  const removeSpec = (productId: string, specIndex: number) => {
    updateProduct(productId, {
      specs: products[productId].specs.filter((_, index) => index !== specIndex)
    });
  };

  const handleSave = () => {
    onSave(products);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-2xl w-full rounded-lg shadow-lg ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      } p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${
            darkMode ? 'text-slate-200' : 'text-slate-800'
          }`}>
            Manage Products
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {Object.values(products)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((product) => (
              <div
                key={product.id}
                className={`rounded-lg ${
                  darkMode ? 'bg-slate-700' : 'bg-slate-100'
                } p-4`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setExpandedProduct(
                      expandedProduct === product.id ? null : product.id
                    )}
                    className={`p-1 rounded transition-colors ${
                      darkMode 
                        ? 'hover:bg-slate-600 text-slate-300' 
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <ChevronIcon expanded={expandedProduct === product.id} />
                  </button>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                    className={`flex-1 px-2 py-1 rounded ${
                      darkMode 
                        ? 'bg-slate-600 text-slate-200 placeholder-slate-400' 
                        : 'bg-white text-slate-900 placeholder-slate-500'
                    } border-0 focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-red-900 hover:bg-red-800 text-red-200' 
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
                  >
                    <TrashIcon />
                  </button>
                </div>

                {expandedProduct === product.id && (
                  <div className="mt-4 pl-9 space-y-3">
                    <div className={`text-sm font-medium ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Specifications
                    </div>
                    <div className="space-y-2">
                      {product.specs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`flex-1 text-sm ${
                            darkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {spec.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <button
                            onClick={() => removeSpec(product.id, index)}
                            className={`p-1 rounded transition-colors ${
                              darkMode 
                                ? 'hover:bg-slate-600 text-slate-400' 
                                : 'hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSpecName}
                          onChange={(e) => setNewSpecName(e.target.value)}
                          placeholder="Add specification..."
                          className={`flex-1 px-2 py-1 text-sm rounded ${
                            darkMode 
                              ? 'bg-slate-600 text-slate-200 placeholder-slate-400' 
                              : 'bg-white text-slate-900 placeholder-slate-500'
                          } border-0 focus:ring-2 focus:ring-blue-500`}
                          onKeyPress={(e) => e.key === 'Enter' && addSpec(product.id)}
                        />
                        <button
                          onClick={() => addSpec(product.id)}
                          className={`p-1 rounded transition-colors ${
                            darkMode 
                              ? 'bg-blue-900 hover:bg-blue-800 text-blue-200' 
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }`}
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={addProduct}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-green-900 hover:bg-green-800 text-green-200' 
                : 'bg-green-100 hover:bg-green-200 text-green-700'
            }`}
          >
            Add Product
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg transition-colors ${
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