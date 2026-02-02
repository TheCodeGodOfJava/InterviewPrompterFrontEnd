// ai-answer.component.ts
import { Component, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranscriptService } from '../../service/transcript-service';

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

  constructor(private transcriptService: TranscriptService) {
    const liveAi = toSignal(this.transcriptService.aiResponse$);

    effect(() => {
      const update = liveAi();
      if (update) this.aiSignal.set(update);
    });

    // Optional: Load initial state from HTTP
    this.transcriptService.loadInitialAiAnswer().subscribe(data => this.aiSignal.set(data));
  }
}