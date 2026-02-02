import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../service/audio-service'; // adjust path if needed

@Component({
  selector: 'app-audio-source-controls',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './audio-source-controls.component.html',
  styleUrl: './audio-source-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioSourceControlsComponent {
  // State as signals
  currentSource = signal<'STEREO_MIX' | 'MICROPHONE'>('STEREO_MIX');
  isSwitching = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed values (reactive, auto-update)
  isMicrophone = computed(() => this.currentSource() === 'MICROPHONE');
  toggleLabel = computed(() =>
    this.isMicrophone()
      ? 'Webcam Mic (Logi C270)'
      : 'Stereo Mix (speakers)'
  );
  toggleIcon = computed(() =>
    this.isMicrophone() ? 'mic' : 'speaker'
  );

  constructor(private audioService: AudioService) {
    // Load initial value from backend (one-time)
    this.audioService.getCurrentSource().subscribe({
      next: (source) => {
        const normalized = (source.trim().toUpperCase() as 'STEREO_MIX' | 'MICROPHONE');
        this.currentSource.set(normalized);
      },
      error: () => console.warn('Could not load initial audio source'),
    });
  }

  toggleSource() {
    // Prevent double-click / race
    if (this.isSwitching()) return;

    const nextSource = this.currentSource() === 'STEREO_MIX' ? 'MICROPHONE' : 'STEREO_MIX';

    this.isSwitching.set(true);
    this.errorMessage.set(null);

    this.audioService.switchSource(nextSource).subscribe({
      next: (msg) => {
        console.log(msg);
        this.currentSource.set(nextSource);
        this.isSwitching.set(false);
      },
      error: (err) => {
        console.error('Switch failed', err);
        this.errorMessage.set('Switch failed — try again');
        this.isSwitching.set(false);
        // We do NOT revert the visual state — user already sees the toggle moved
      },
    });
  }
}