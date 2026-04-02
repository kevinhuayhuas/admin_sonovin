import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private url = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get(this.url, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  create(client: Partial<Client>): Observable<any> {
    return this.http.post(this.url, client);
  }

  update(id: number, client: Partial<Client>): Observable<any> {
    return this.http.patch(`${this.url}/${id}`, client);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  count(): Observable<any> {
    return this.http.get(`${this.url}/count`);
  }
}
