import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subscription } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private url = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(this.url, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  getExpiring(days: number): Observable<any> {
    return this.http.get(`${this.url}/expiring/${days}`);
  }

  getRevenue(): Observable<any> {
    return this.http.get(`${this.url}/revenue`);
  }

  create(sub: Partial<Subscription>): Observable<any> {
    return this.http.post(this.url, sub);
  }

  update(id: number, sub: Partial<Subscription>): Observable<any> {
    return this.http.patch(`${this.url}/${id}`, sub);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
