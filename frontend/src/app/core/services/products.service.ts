 import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(params?: { categoryId?: string; page?: number; limit?: number }): Observable<ProductsResponse> {
    let httpParams = new HttpParams();
    if (params?.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<ProductsResponse>(this.apiUrl, { params: httpParams });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProductWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/upload/product`, formData);
  }

  updateProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categories`);
  }
}
