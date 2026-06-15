 
export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  base64: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  size?: string;
  brand?: string;
  condition: Condition;
  imageUrl?: string;
  isActive: boolean;
  categoryId: string;
  category: Category;
  createdAt: string;
  images?: ProductImage[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  buyerName: string;
  buyerEmail: string;
  paymentGateway?: string;
  paymentIntentId?: string;
  paymentConfirmedAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

export interface SaleNotification {
  type: 'NEW_SALE';
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  total: number;
  itemCount: number;
  products: string[];
  paidAt: Date;
}