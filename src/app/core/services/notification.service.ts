import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 20, leido?: boolean): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (leido !== undefined) params = params.set('leido', leido);
    return this.http.get(this.url, { params });
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.url}/unread-count`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.url}/${id}/read`, {});
  }

  markClientNotified(id: number): Observable<any> {
    return this.http.patch(`${this.url}/${id}/client-notified`, {});
  }
}
