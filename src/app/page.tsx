'use client';

import { useState } from 'react';
import OrderEntry from './components/OrderEntry';
import OrdersTable from './components/OrdersTable';
import ProductManager from './components/ProductManager';
import { Order, Product, ProductTemplates } from './types/order';

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

  const handleNewOrder = (orderData: {
    firstName: string;
    lastName: string;
    products: {
      burnPad: Product;
      foamPad: Product;
      bandageHolder: Product;
      paddockBag: Product;
      schoolingPad: Product;
      raincover: Product;
      blanket: Product;
      saddle: Product;
    };
  }) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      ...orderData,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOrders(prev => [...prev, newOrder]);
  };

  const handleOrderComplete = (orderId: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed', updatedAt: new Date() }
          : order
      )
    );
  };

  const handleArchiveOrders = () => {
    const now = new Date();
    setOrders(prev =>
      prev.map(order =>
        order.status === 'completed'
          ? { ...order, status: 'archived', archivedAt: now, updatedAt: now }
          : order
      )
    );
  };

  const handleSaveProducts = (newProducts: ProductTemplates) => {
    setProductTemplates(newProducts);
  };

  const openOrders = orders.filter(order => order.status === 'open');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const archivedOrders = orders.filter(order => order.status === 'archived');

  return (
    <main className={`min-h-screen p-8 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      {/* Dark Mode and Product Manager Toggles */}
      <div className="fixed top-4 right-4 flex gap-2">
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
      
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Order Entry */}
        <div className={`col-span-3 ${
          darkMode ? 'bg-slate-800' : 'bg-white'
        } p-6 rounded-lg shadow-md`}>
          <OrderEntry 
            onSubmit={handleNewOrder}
            darkMode={darkMode}
            orders={orders}
            productTemplates={productTemplates}
          />
        </div>

        {/* Right Column - Order Tables */}
        <div className="col-span-9 space-y-8">
          <div className={`${
            darkMode ? 'bg-slate-800' : 'bg-white'
          } p-6 rounded-lg shadow-md`}>
            <OrdersTable
              orders={openOrders}
              title="Open Orders"
              onStatusChange={handleOrderComplete}
              darkMode={darkMode}
            />
          </div>
          <div className={`${
            darkMode ? 'bg-slate-800' : 'bg-white'
          } p-6 rounded-lg shadow-md`}>
            <OrdersTable
              orders={completedOrders}
              title="Completed Orders"
              darkMode={darkMode}
              onArchive={handleArchiveOrders}
            />
          </div>
          {archivedOrders.length > 0 && (
            <div className={`${
              darkMode ? 'bg-slate-800' : 'bg-white'
            } p-6 rounded-lg shadow-md`}>
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
