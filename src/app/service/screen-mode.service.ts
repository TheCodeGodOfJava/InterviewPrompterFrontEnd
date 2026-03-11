import { Injectable, signal } from '@angular/core';

export type ScreenMode = 'normal' | 'overlay';

@Injectable({
  providedIn: 'root',
})
export class ScreenModeService {
  private modeSignal = signal<ScreenMode>('normal');
  
  get mode() {
    return this.modeSignal.asReadonly();
  }

  toggleMode() {
    const current = this.modeSignal();
    this.modeSignal.set(current === 'normal' ? 'overlay' : 'normal');
  }

  setMode(mode: ScreenMode) {
    this.modeSignal.set(mode);
  }
}
