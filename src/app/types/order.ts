export interface Product {
  id: string;
  name: string;
  quantity: number;
  selected: boolean;
  specs: Record<string, string>;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  products: Record<string, Product>;
  cartNumber: number;
  status: 'open' | 'waiting' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export interface ProductTemplates {
  [key: string]: {
    id: string;
    name: string;
    specs: string[];
    sortOrder: number;
  };
} 