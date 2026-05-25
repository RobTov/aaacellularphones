import { User } from './user.model';
import { Payment } from './payment.model';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payment?: Payment;
  user?: User;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  shipping_address: any;
  billing_address: any;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}
