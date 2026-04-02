import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(this.url, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  create(user: Partial<User> & { password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, user);
  }

  update(id: number, user: Partial<User>): Observable<any> {
    return this.http.patch(`${this.url}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
