import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private url = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10, subscriptionId?: number, estado?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (subscriptionId) params = params.set('subscriptionId', subscriptionId);
    if (estado) params = params.set('estado', estado);
    return this.http.get(this.url, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  getBySubscription(subscriptionId: number): Observable<any> {
    return this.http.get(`${this.url}/subscription/${subscriptionId}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.url}/stats`);
  }

  getOverdue(): Observable<any> {
    return this.http.get(`${this.url}/overdue`);
  }

  create(payment: Partial<Payment>): Observable<any> {
    return this.http.post(this.url, payment);
  }

  update(id: number, payment: Partial<Payment>): Observable<any> {
    return this.http.patch(`${this.url}/${id}`, payment);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
