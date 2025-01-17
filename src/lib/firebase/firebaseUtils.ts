import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  getDocs,
  orderBy,
  where,
  Timestamp,
  deleteDoc 
} from 'firebase/firestore';
import { Order } from '../types/order';

// Collection reference
const ORDERS_COLLECTION = 'orders';

// Add a new order
export const addOrder = async (orderData: Omit<Order, 'id'>) => {
  try {
    console.log('Adding order to Firestore:', orderData);
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('Document written with ID:', docRef.id);
    return { 
      ...orderData, 
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error adding order: ', error);
    throw error;
  }
};

// Get all orders
export const getOrders = async () => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        archivedAt: data.archivedAt ? data.archivedAt.toDate() : undefined
      };
    }) as Order[];
  } catch (error) {
    console.error('Error getting orders: ', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: 'open' | 'completed' | 'archived') => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
      ...(status === 'archived' ? { archivedAt: Timestamp.now() } : {})
    });
  } catch (error) {
    console.error('Error updating order: ', error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status: 'open' | 'completed' | 'archived') => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by status: ', error);
    throw error;
  }
};

// Update order products
export const updateOrderProducts = async (orderId: string, products: Record<string, Product>) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      products,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating products: ', error);
    throw error;
  }
};

// Add delete order function
export const deleteOrder = async (orderId: string) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Error deleting order: ', error);
    throw error;
  }
}; 