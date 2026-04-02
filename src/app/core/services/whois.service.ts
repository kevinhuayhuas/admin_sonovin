import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WhoisService {
  constructor(private http: HttpClient) {}

  lookup(domain: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/whois/${domain}`);
  }
}
