import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitorService {
  private apiUrl = 'http://localhost:8080/api/capture/monitor';
  
  constructor(private http: HttpClient) { }

  getCurrentMonitor(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }

  switchMonitor(monitor: 'LEFT' | 'RIGHT'): Observable<string> {
    return this.http.post(this.apiUrl, { monitor }, { responseType: 'text' });
  }
}