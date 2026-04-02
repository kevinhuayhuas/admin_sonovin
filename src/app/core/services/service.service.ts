import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceItem } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private url = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(this.url, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  create(service: Partial<ServiceItem>): Observable<any> {
    return this.http.post(this.url, service);
  }

  update(id: number, service: Partial<ServiceItem>): Observable<any> {
    return this.http.patch(`${this.url}/${id}`, service);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
