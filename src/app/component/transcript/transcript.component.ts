// transcript.component.ts
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranscriptService, TranscriptUpdate } from '../../service/TranscriptService';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
  ],
  templateUrl: './transcript.component.html',
  styleUrl: './transcript.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptComponent {
  // ── Main data signal ── updated from both HTTP and WebSocket
  protected transcriptSignal = signal<TranscriptUpdate>({
    fullText: '',
    version: 0,
    words: [],
  });

  // ── Derived / computed signals ── very efficient, only recalculate when needed
  words = computed(() => this.transcriptSignal().words);
  fullText = computed(() => this.transcriptSignal().fullText);
  wordCount = computed(() => this.words().length);
  isEmpty = computed(() => this.wordCount() === 0);

  // Loading & error state (can also be signals if you want)
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private transcriptService: TranscriptService) {
    // Convert observable → signal (once)
    const liveTranscript = toSignal(this.transcriptService.transcript$, {
      initialValue: { fullText: '', version: 0, words: [] },
    });

    effect(() => {
      const update = liveTranscript();
      if (update) {
        this.transcriptSignal.set(update);
        this.isLoading = false;
        this.errorMessage = null;
      }
    });
    // HTTP initial load (still uses subscribe because it's a one-time observable)
    this.transcriptService.loadInitialTranscript().subscribe({
      next: (data) => {
        this.transcriptSignal.set(data);
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: () => {
        this.errorMessage = 'Failed to load initial transcript...';
        this.isLoading = false;
      },
    });
  }
}
