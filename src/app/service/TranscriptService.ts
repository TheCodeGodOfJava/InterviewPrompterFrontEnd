// src/app/services/transcript.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface WordEntry {
  index: number;
  word: string;
}

export interface TranscriptUpdate {
  fullText: string;
  version: number;
  words: WordEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptService {

  private client!: Client;
  private transcriptSubject = new BehaviorSubject<TranscriptUpdate>({
    fullText: '',
    version: 0,
    words: []
  });

  constructor(private http: HttpClient) {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',          // change to your backend URL
      connectHeaders: {},
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      webSocketFactory: () => new SockJS('http://localhost:8080/ws')
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');
      this.client.subscribe('/topic/transcript', (message) => {
        const update: TranscriptUpdate = JSON.parse(message.body);
        this.transcriptSubject.next(update);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error', frame);
    };

    this.client.activate();
  }

  // Get initial state via HTTP (recommended for fast first render)
  loadInitialTranscript(): Observable<TranscriptUpdate> {
    return this.http.get<TranscriptUpdate>('http://localhost:8080/api/transcript');
  }

  // Live observable for component to subscribe to
  get transcript$(): Observable<TranscriptUpdate> {
    return this.transcriptSubject.asObservable();
  }

  // Optional: manual disconnect (not usually needed)
  disconnect() {
    this.client.deactivate();
  }
}