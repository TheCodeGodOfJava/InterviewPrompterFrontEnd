import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

// Interfaces
export interface WordEntry {
  index: number;
  word: string;
}

export interface TranscriptUpdate {
  fullText: string;
  version: number;
  words: WordEntry[];
}

// NEW: Match the Java record: public record AIUpdate(String answer, String status)
export interface AiUpdate {
  answer: string;
  status: 'READY' | 'THINKING' | 'ERROR';
}

@Injectable({
  providedIn: 'root'
})
export class TranscriptService {
  private client!: Client;

  // 1. Transcript stream
  private transcriptSubject = new BehaviorSubject<TranscriptUpdate>({
    fullText: '',
    version: 0,
    words: []
  });

  // 2. NEW: AI response stream
  private aiResponseSubject = new BehaviorSubject<AiUpdate>({
    answer: '',
    status: 'READY'
  });

  constructor(private http: HttpClient) {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log(str)
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');

      // --- Subscribe to Transcript ---
      this.client.subscribe('/topic/transcript', (message) => {
        this.transcriptSubject.next(JSON.parse(message.body));
      });

      // --- Subscribe to AI Responses ---
      this.client.subscribe('/topic/ai-response', (message) => {
        const update: AiUpdate = JSON.parse(message.body);
        this.aiResponseSubject.next(update);
      });
    };

    this.client.onStompError = (frame) => console.error('STOMP error', frame);
    this.client.activate();
  }

  // --- HTTP GETs for initial load ---
  loadInitialTranscript(): Observable<TranscriptUpdate> {
    return this.http.get<TranscriptUpdate>('http://localhost:8080/api/transcript');
  }

  loadInitialAiAnswer(): Observable<AiUpdate> {
    return this.http.get<AiUpdate>('http://localhost:8080/api/ai/latest');
  }

  // --- Observables for Components ---
  get transcript$(): Observable<TranscriptUpdate> {
    return this.transcriptSubject.asObservable();
  }

  get aiResponse$(): Observable<AiUpdate> {
    return this.aiResponseSubject.asObservable();
  }

  disconnect() {
    this.client.deactivate();
  }
}