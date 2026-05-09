 import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem, Product } from '../models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);

  readonly items$ = this.cartItems$.asObservable();
  readonly count$ = this.items$.pipe(map(items => items.reduce((acc, i) => acc + i.quantity, 0)));
  readonly total$ = this.items$.pipe(
    map(items => items.reduce((acc, i) => acc + Number(i.product.price) * i.quantity, 0)),
  );

  constructor(private snackBar: MatSnackBar) {}

  get items(): CartItem[] {
    return this.cartItems$.value;
  }

  get total(): number {
    return this.items.reduce((acc, i) => acc + Number(i.product.price) * i.quantity, 0);
  }

  addItem(product: Product, quantity = 1): void {
    const currentItems = this.cartItems$.value;
    const existing = currentItems.find(i => i.product.id === product.id);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        this.snackBar.open(`Solo hay ${product.stock} unidades disponibles`, 'OK', { duration: 3000 });
        return;
      }
      this.cartItems$.next(currentItems.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i));
    } else {
      this.cartItems$.next([...currentItems, { product, quantity }]);
    }
    this.snackBar.open(`"${product.name}" añadido al carrito`, 'Ver carrito', { duration: 2500 });
  }

  removeItem(productId: string): void {
    this.cartItems$.next(this.cartItems$.value.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) { this.removeItem(productId); return; }
    this.cartItems$.next(this.cartItems$.value.map(i => i.product.id === productId ? { ...i, quantity } : i));
  }

  clear(): void {
    this.cartItems$.next([]);
  }
}
