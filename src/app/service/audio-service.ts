import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

// audio.service.ts
@Injectable({ providedIn: 'root' })
export class AudioService {
  private apiUrl = 'http://localhost:8080/api/audio';

  constructor(private http: HttpClient) {}

  switchSource(source: 'STEREO_MIX' | 'MICROPHONE'): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/switch-source`, { source }, { responseType: 'text' as 'json' });
  }

  getCurrentSource(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/current-source`, { responseType: 'text' as 'json' });
  }
}