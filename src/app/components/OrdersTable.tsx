'use client';

import { useState } from 'react';
import { Order, Product, ProductTemplates } from '../types/order';
import EditProductsModal from './EditProductsModal';
import OrderDetailsModal from './OrderDetailsModal';

interface OrdersTableProps {
  orders: Order[];
  title: string;
  darkMode: boolean;
  onStatusChange?: (orderId: string) => void;
  onArchive?: () => void;
  onUpdateProducts?: (orderId: string, products: Record<string, Product>) => void;
  productTemplates: ProductTemplates;
  isWaitingTable?: boolean;
  compact?: boolean;
  onDelete?: (orderId: string) => void;
}

const formatSpecName = (name: string) => {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

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
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export default function OrdersTable({ orders, title, darkMode, onStatusChange, onArchive, onUpdateProducts, productTemplates, isWaitingTable, compact, onDelete }: OrdersTableProps) {
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(title === "Archived Orders");
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'waiting'>('active');

  const toggleProductSpecs = (orderId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const isOpenOrdersTable = title === "Open Orders";
  const isCompletedOrdersTable = title === "Completed Orders";
  const isArchivedOrdersTable = title === "Archived Orders";

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Filter orders based on search term
  const filteredOrders = sortedOrders
    .filter(order => {
      if (isOpenOrdersTable) {
        console.log('Filtering order:', order, 'activeTab:', activeTab);
        
        if (activeTab === 'active') {
          return order.status === 'open' && order.cartNumber > 0;
        } else if (activeTab === 'waiting') {
          return order.status === 'waiting';
        }
      }
      return order.status === title.toLowerCase().replace(' orders', '');
    })
    .filter(order => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.firstName.toLowerCase().includes(searchLower) ||
        order.lastName.toLowerCase().includes(searchLower) ||
        Object.values(order.products)
          .filter(product => product.selected)
          .some(product => product.name.toLowerCase().includes(searchLower))
      );
    });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isArchivedOrdersTable && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              aria-label={isCollapsed ? 'Expand archived orders' : 'Collapse archived orders'}
            >
              <ChevronIcon expanded={!isCollapsed} />
            </button>
          )}
          <h2 className={`text-2xl font-bold ${
            darkMode ? 'text-slate-200' : 'text-slate-800'
          }`}>
            {title}
            {(isArchivedOrdersTable || isCompletedOrdersTable) && orders.length > 0 && (
              <span className={`ml-2 text-sm font-normal ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                ({filteredOrders.length} {searchTerm ? 'found' : ''} of {orders.length} orders)
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-4 mb-6">
          {(isArchivedOrdersTable || isCompletedOrdersTable) && orders.length > 0 && (
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`px-4 py-2 rounded-md text-sm ${
                darkMode 
                  ? 'bg-slate-700 text-slate-200 placeholder-slate-400 border-slate-600' 
                  : 'bg-white text-slate-900 placeholder-slate-500 border-slate-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          )}
          {isCompletedOrdersTable && orders.length > 0 && onArchive && (
            <button
              onClick={onArchive}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-700 text-white'
              }`}
            >
              Archive All Orders
            </button>
          )}
        </div>
      </div>
      {isOpenOrdersTable && (
        <>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'active'
                  ? darkMode
                    ? 'bg-slate-800 text-slate-200 border-b-2 border-blue-500'
                    : 'bg-white text-slate-900 border-b-2 border-blue-500'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Orders ({orders.filter(order => order.status === 'open' && order.cartNumber > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('waiting')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'waiting'
                  ? darkMode
                    ? 'bg-slate-800 text-slate-200 border-b-2 border-yellow-500'
                    : 'bg-white text-slate-900 border-b-2 border-yellow-500'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting Orders ({orders.filter(order => order.status === 'waiting').length})
            </button>
          </div>
        </>
      )}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className={`min-w-full ${compact ? 'text-sm' : ''}`}>
            <thead className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} ${compact ? 'text-xs' : ''}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-500'
                } uppercase tracking-wider`}>
                  Date
                </th>
                {isOpenOrdersTable && activeTab === 'active' && (
                  <th className={`px-6 py-3 text-left text-xs font-medium ${
                    darkMode ? 'text-slate-300' : 'text-slate-500'
                  } uppercase tracking-wider`}>
                    Cart
                  </th>
                )}
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-500'
                } uppercase tracking-wider`}>
                  Customer
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-500'
                } uppercase tracking-wider`}>
                  Products
                </th>
                {onStatusChange && (
                  <th className={`px-6 py-3 text-center text-xs font-medium ${
                    darkMode ? 'text-slate-300' : 'text-slate-500'
                  } uppercase tracking-wider`}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className={`${
              darkMode ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-slate-200'
            } divide-y ${compact ? 'text-sm' : ''}`}>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className={`px-4 py-3 ${compact ? 'whitespace-normal' : 'whitespace-nowrap'}`}>
                    <div className={`text-sm ${
                      darkMode ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                      {order.archivedAt && (
                        <div className={`text-xs ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          Archived: {new Date(order.archivedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  {isOpenOrdersTable && activeTab === 'active' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.cartNumber && (
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-lg text-lg font-semibold
                          ${CART_COLORS[order.cartNumber as keyof typeof CART_COLORS].bg}
                          ${CART_COLORS[order.cartNumber as keyof typeof CART_COLORS].text}
                        `}>
                          {order.cartNumber}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      darkMode ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      {order.firstName} {order.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${
                      darkMode ? 'text-slate-200' : 'text-slate-900'
                    } space-y-3`}>
                      <button
                        onClick={() => toggleProductSpecs(order.id)}
                        className={`text-left hover:opacity-75 transition-opacity ${
                          expandedProducts[order.id] ? 'font-semibold' : ''
                        }`}
                      >
                        {Object.entries(order.products)
                          .filter(([_, product]) => product.selected)
                          .map(([_, product]) => `${product.name} (${product.quantity})`)
                          .join(', ')}
                      </button>
                      
                      {expandedProducts[order.id] && (
                        <div className="pl-4 pt-2 space-y-2">
                          {Object.entries(order.products)
                            .filter(([_, product]) => product.selected)
                            .map(([key, product]) => (
                              <div key={key} className="space-y-1">
                                <div className="font-medium">
                                  {product.name}: {product.quantity}
                                </div>
                                {product.specs && Object.entries(product.specs).length > 0 && (
                                  <div className={`pl-4 text-xs ${
                                    darkMode ? 'text-slate-400' : 'text-slate-600'
                                  } space-y-0.5`}>
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
                      )}
                    </div>
                  </td>
                  {onStatusChange && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className={`${
                            darkMode 
                              ? 'text-green-400 hover:text-green-300'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          Edit Products
                        </button>
                        {activeTab === 'waiting' ? (
                          <div className="flex items-center justify-center space-x-4">
                            <button
                              onClick={() => onStatusChange(order.id, 'open')}
                              className={`${
                                darkMode 
                                  ? 'text-blue-400 hover:text-blue-300'
                                  : 'text-blue-600 hover:text-blue-900'
                              }`}
                            >
                              Move to Open Orders →
                            </button>
                            {onDelete && (
                              <button
                                onClick={() => onDelete(order.id)}
                                className={`${
                                  darkMode 
                                    ? 'text-red-400 hover:text-red-300'
                                    : 'text-red-600 hover:text-red-900'
                                }`}
                                title="Delete Order"
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => onStatusChange(order.id, 'completed')}
                            className={`${
                              darkMode 
                                ? 'text-blue-400 hover:text-blue-300'
                                : 'text-blue-600 hover:text-blue-900'
                            }`}
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && searchTerm && (
            <div className={`text-center py-8 ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              No orders found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}
      {editingOrder && (
        <EditProductsModal
          order={editingOrder}
          darkMode={darkMode}
          onClose={() => setEditingOrder(null)}
          onSave={(products) => {
            if (onUpdateProducts) {
              onUpdateProducts(editingOrder.id, products);
            }
            setEditingOrder(null);
          }}
          productTemplates={productTemplates}
        />
      )}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          darkMode={darkMode}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
}