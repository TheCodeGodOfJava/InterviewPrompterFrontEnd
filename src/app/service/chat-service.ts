import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';

export interface AiUpdate {
  answer: string;
  status: 'READY' | 'THINKING' | 'ERROR';
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private client!: Client;

  public messages = signal<ChatMessage[]>([]);

  private aiResponseSubject = new BehaviorSubject<AiUpdate>({
    answer: '',
    status: 'READY',
  });

  constructor(private http: HttpClient) {
    this.connectWebSocket();
    this.loadInitialHistory();
  }

  private connectWebSocket() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    });

    this.client.onConnect = () => {
      this.client.subscribe('/topic/context', (msg) => {
        this.messages.set(JSON.parse(msg.body));
      });

      this.client.subscribe('/topic/ai-response', (msg) => {
        const update: AiUpdate = JSON.parse(msg.body);
        this.aiResponseSubject.next(update);
      });
    };

    this.client.activate();
  }

  private loadInitialHistory() {
    this.http.get<ChatMessage[]>('http://localhost:8080/api/chat/history').subscribe({
      next: (data) => this.messages.set(data),
      error: (err) => console.error('Failed to load chat history', err),
    });
  }

  get aiResponse$(): Observable<AiUpdate> {
    return this.aiResponseSubject.asObservable();
  }

  disconnect() {
    this.client.deactivate();
  }

  requestManualAnalysis() {
    this.aiResponseSubject.next({ answer: '', status: 'THINKING' });

    if (this.client && this.client.active) {
      this.client.publish({
        destination: '/app/request-analysis',
        body: JSON.stringify({ action: 'generate_now' }) 
      });
    } else {
      console.error('WebSocket is not connected. Cannot request analysis.');
      this.aiResponseSubject.next({ answer: 'Connection error.', status: 'ERROR' });
    }
  }
}