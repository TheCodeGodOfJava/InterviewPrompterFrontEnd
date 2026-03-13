import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { MonitorService } from '../../service/monitor-service';

@Component({
  selector: 'app-monitor-selector',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatIconModule, MatTooltip, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './monitor-selector.component.html',
  styleUrl: './monitor-selector.component.scss',
})
export class MonitorSelectorComponent {
  currentMonitor = signal<'LEFT' | 'RIGHT'>('LEFT');
  isSwitching = signal(false);
  errorMessage = signal<string | null>(null);

  isRight = computed(() => this.currentMonitor() === 'RIGHT');
  toggleLabel = computed(() => this.isRight() ? 'Capturing Right Monitor' : 'Capturing Left Monitor');

  constructor(private monitorService: MonitorService) {
    this.monitorService.getCurrentMonitor().subscribe({
      next: (source) => this.currentMonitor.set(source.trim().toUpperCase() as 'LEFT' | 'RIGHT'),
      error: () => console.warn('Could not load initial monitor source'),
    });
  }

  toggleMonitor() {
    if (this.isSwitching()) return;

    const nextSource = this.currentMonitor() === 'LEFT' ? 'RIGHT' : 'LEFT';
    this.isSwitching.set(true);
    this.errorMessage.set(null);

    this.monitorService.switchMonitor(nextSource).subscribe({
      next: () => {
        this.currentMonitor.set(nextSource);
        this.isSwitching.set(false);
      },
      error: (err) => {
        console.error('Switch failed', err);
        this.errorMessage.set('Switch failed — try again');
        this.isSwitching.set(false);
      },
    });
  }
}