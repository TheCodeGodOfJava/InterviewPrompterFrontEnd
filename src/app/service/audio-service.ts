import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Observable, tap } from "rxjs";

// audio.service.ts
@Injectable({ providedIn: 'root' })
export class AudioService {

  isRecognitionActive = signal<boolean>(false);

  private apiUrl = 'http://localhost:8080/api/audio';

  constructor(private http: HttpClient) { }

  switchSource(source: 'STEREO_MIX' | 'MICROPHONE'): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/switch-source`, { source }, { responseType: 'text' as 'json' });
  }

  getCurrentSource(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/current-source`, { responseType: 'text' as 'json' });
  }

  refreshStatus() {
    this.http.get<boolean>(`${this.apiUrl}/recognition-status`).subscribe(
      status => this.isRecognitionActive.set(status)
    );
  }

  toggleRecognition(enabled: boolean): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/toggle-recognition`, null, {
      params: { enabled }
    }).pipe(
      tap(status => this.isRecognitionActive.set(status))
    );
  }

}