'use client';

import { Order } from '../types/order';

interface OrderDetailsModalProps {
  order: Order;
  darkMode: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, darkMode, onClose }: OrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-3xl w-full rounded-lg shadow-lg ${
        darkMode ? 'bg-slate-800' : 'bg-white'
      } p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Order Details - {order.firstName} {order.lastName}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Customer Information
            </h3>
            <div className={`grid grid-cols-2 gap-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <div>
                <span className="font-medium">Name:</span> {order.firstName} {order.lastName}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Products
            </h3>
            <div className="space-y-4">
              {Object.entries(order.products)
                .filter(([_, product]) => product.selected)
                .map(([key, product]) => (
                  <div key={key} className={`p-4 rounded-lg ${
                    darkMode ? 'bg-slate-700' : 'bg-slate-50'
                  }`}>
                    <div className="font-medium mb-2">
                      {product.name} ({product.quantity})
                    </div>
                    {product.specs && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(product.specs).map(([spec, value]) => (
                          <div key={spec}>
                            <span className="font-medium">{spec}:</span> {value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${
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
  );
} 