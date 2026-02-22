import { Component, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; 
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatService } from '../../service/chat-service';
import { MarkdownComponent } from "ngx-markdown";

@Component({
  selector: 'app-ai-answer',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatProgressSpinnerModule, 
    MatIconModule, 
    MatButtonModule, 
    MarkdownComponent
  ],
  templateUrl: './answer.component.html',
  styleUrl: './answer.component.scss', 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiAnswerComponent {
  protected aiSignal = signal<{ answer: string; status: string }>({
    answer: '',
    status: 'READY',
  });

  answer = computed(() => this.aiSignal().answer);
  isThinking = computed(() => this.aiSignal().status === 'THINKING');

  constructor(private chatService: ChatService) {
    const liveAi = toSignal(this.chatService.aiResponse$);

    effect(() => {
      const update = liveAi();
      if (update) this.aiSignal.set(update);
    }, { allowSignalWrites: true }); 
  }

  generateAnswer() {
    this.chatService.requestManualAnalysis();
  }
}