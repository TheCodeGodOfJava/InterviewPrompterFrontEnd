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

  // Subject for Latest Answer (for AiAnswerComponent)
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
      // Topic 1: Full History
      this.client.subscribe('/topic/context', (msg) => {
        this.messages.set(JSON.parse(msg.body));
      });

      // Topic 2: Latest Answer (Thinking/Ready status)
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

  // Getter for the component to subscribe to
  get aiResponse$(): Observable<AiUpdate> {
    return this.aiResponseSubject.asObservable();
  }

  disconnect() {
    this.client.deactivate();
  }
}
