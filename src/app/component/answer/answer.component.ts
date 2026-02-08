// ai-answer.component.ts
import { Component, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatService } from '../../service/chat-service';

@Component({
  selector: 'app-ai-answer',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule],
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
    });
  }
}