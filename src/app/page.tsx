'use client';

import { useState, useEffect } from 'react';
import OrderEntry from './components/OrderEntry';
import OrdersTable from './components/OrdersTable';
import ProductManager from './components/ProductManager';
import { Order, Product, ProductTemplates } from './types/order';
import { getOrders, addOrder, updateOrderStatus, updateOrderProducts, deleteOrder } from '@/lib/firebase/firebaseUtils';

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

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

const INITIAL_PRODUCTS: ProductTemplates = {
  burnPad: {
    id: 'burnPad',
    name: 'Burn Pad',
    specs: ['baseColor', 'corduraColor', 'logoColor'],
    sortOrder: 0
  },
  foamPad: {
    id: 'foamPad',
    name: 'Foam Pad',
    specs: ['baseColor', 'seatColor', 'trimColor', 'pipingColor', 'wearLeatherColor', 'logoColor'],
    sortOrder: 1
  },
  bandageHolder: {
    id: 'bandageHolder',
    name: 'Bandage Holder',
    specs: ['baseColor', 'logoColor', 'grommetColor'],
    sortOrder: 2
  },
  paddockBag: {
    id: 'paddockBag',
    name: 'Paddock Bag',
    specs: ['baseColor', 'handleColor', 'logoColor'],
    sortOrder: 3
  },
  schoolingPad: {
    id: 'schoolingPad',
    name: 'Schooling Pad',
    specs: ['baseColor', 'pipingColor', 'logoColor'],
    sortOrder: 4
  },
  raincover: {
    id: 'raincover',
    name: 'Raincover',
    specs: ['baseColor', 'logoColor'],
    sortOrder: 5
  },
  blanket: {
    id: 'blanket',
    name: 'Blanket',
    specs: ['type', 'baseColor', 'trimColor', 'logoColor'],
    sortOrder: 6
  },
  saddle: {
    id: 'saddle',
    name: 'Saddle',
    specs: ['type', 'baseColor', 'stitchColor', 'topAccentColor', 'bottomAccentColor'],
    sortOrder: 7
  }
};

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showProductManager, setShowProductManager] = useState(false);
  const [productTemplates, setProductTemplates] = useState<ProductTemplates>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);

  // Load orders when page loads
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      console.log('Starting to fetch orders...');
      const fetchedOrders = await getOrders();
      console.log('Fetched orders:', fetchedOrders);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false); // Make sure loading is set to false in both success and error cases
    }
  };

  const handleNewOrder = async (orderData: {
    firstName: string;
    lastName: string;
    products: Record<string, Product>;
    cartNumber: number;
    status?: 'open' | 'waiting';
  }) => {
    try {
      console.log('Submitting new order:', orderData);
      const newOrder = await addOrder({
        ...orderData,
        status: orderData.status || 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Order created in Firebase:', newOrder);
      
      setOrders(prev => [...prev, newOrder]);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const handleOrderComplete = async (orderId: string, newStatus: 'open' | 'completed') => {
    try {
      // If moving from waiting to open, find the first available cart number
      if (newStatus === 'open') {
        const occupiedCarts = orders
          .filter(order => order.status === 'open')
          .map(order => order.cartNumber);
        
        // Find first available cart number (1-10)
        let availableCart = 1;
        while (occupiedCarts.includes(availableCart) && availableCart <= 10) {
          availableCart++;
        }

        if (availableCart > 10) {
          alert('No carts available. Please complete some active orders first.');
          return;
        }

        // Update order with new status and cart number
        await updateOrderStatus(orderId, newStatus);
        await updateOrderProducts(orderId, {
          ...orders.find(o => o.id === orderId)?.products || {},
          cartNumber: availableCart
        });

        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { 
                  ...order, 
                  status: newStatus, 
                  cartNumber: availableCart,
                  updatedAt: new Date() 
                }
              : order
          )
        );
      } else {
        // Normal completion flow
        await updateOrderStatus(orderId, newStatus);
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, status: newStatus, updatedAt: new Date() }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleArchiveOrders = async () => {
    try {
      const completedOrders = orders.filter(order => order.status === 'completed');
      
      // Update each completed order to archived
      await Promise.all(
        completedOrders.map(order => updateOrderStatus(order.id, 'archived'))
      );

      setOrders(prev =>
        prev.map(order =>
          order.status === 'completed'
            ? { ...order, status: 'archived', archivedAt: new Date(), updatedAt: new Date() }
            : order
        )
      );
    } catch (error) {
      console.error('Error archiving orders:', error);
    }
  };

  const handleSaveProducts = (newProducts: ProductTemplates) => {
    setProductTemplates(newProducts);
  };

  const handleUpdateProducts = async (orderId: string, products: Record<string, Product>) => {
    try {
      await updateOrderProducts(orderId, products);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, products, updatedAt: new Date() }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating products:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      try {
        await deleteOrder(orderId);
        setOrders(prev => prev.filter(order => order.id !== orderId));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const openOrders = orders.filter(order => order.status === 'open');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const archivedOrders = orders.filter(order => order.status === 'archived');
  const waitingOrders = orders.filter(order => order.status === 'waiting');

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <main className={`min-h-screen p-8 ${darkMode ? 'bg-slate-900' : 'bg-white'} overflow-x-hidden`}>
      {/* Dark Mode and Product Manager Toggles */}
      <div className="fixed top-4 right-4 flex gap-2 z-30">
        <button
          onClick={() => setShowProductManager(true)}
          className={`p-2 rounded-lg ${
            darkMode 
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          aria-label="Manage Products"
        >
          <CogIcon />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg ${
            darkMode 
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Product Manager Modal */}
      {showProductManager && (
        <ProductManager
          darkMode={darkMode}
          onClose={() => setShowProductManager(false)}
          initialProducts={productTemplates}
          onSave={handleSaveProducts}
        />
      )}
      
      <div className="grid grid-cols-12 gap-4 md:gap-8 relative">
        {/* Left Column - Order Entry */}
        <div className="col-span-3">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 rounded-lg shadow-md`}>
            <OrderEntry 
              onSubmit={handleNewOrder}
              darkMode={darkMode}
              orders={orders}
              productTemplates={productTemplates}
            />
          </div>
        </div>

        {/* Middle Column - Main Order Tables */}
        <div className="col-span-9 space-y-8">
          {/* Open Orders */}
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 rounded-lg shadow-md border-l-4 border-blue-500`}>
            <OrdersTable
              orders={orders}
              title="Open Orders"
              onStatusChange={handleOrderComplete}
              onDelete={handleDeleteOrder}
              darkMode={darkMode}
              onUpdateProducts={handleUpdateProducts}
              productTemplates={productTemplates}
            />
          </div>

          {/* Completed Orders */}
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 rounded-lg shadow-md border-l-4 border-green-500`}>
            <OrdersTable
              orders={completedOrders}
              title="Completed Orders"
              darkMode={darkMode}
              onArchive={handleArchiveOrders}
            />
          </div>

          {/* Archived Orders */}
          {archivedOrders.length > 0 && (
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 rounded-lg shadow-md border-t-4 border-slate-500`}>
              <OrdersTable
                orders={archivedOrders}
                title="Archived Orders"
                darkMode={darkMode}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
