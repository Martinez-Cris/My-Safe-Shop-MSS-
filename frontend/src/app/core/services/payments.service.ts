import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem, Order } from '../models/product.model';

export interface CheckoutPayload {
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  shippingAddress?: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface CheckoutResponse {
  order: Order;
  payment: {
    orderId: string;
    gateway: string;
    checkoutUrl: string;
    paymentIntentId: string;
  };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  checkout(payload: CheckoutPayload): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, payload);
  }

  buildCheckoutPayload(cartItems: CartItem[], buyer: { name: string; email: string; phone?: string; address?: string }): CheckoutPayload {
    return {
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone,
      shippingAddress: buyer.address,
      items: cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity })),
    };
  }

  redirectToGateway(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${orderId}`);
  }
} 
