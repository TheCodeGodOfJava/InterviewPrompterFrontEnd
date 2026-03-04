import { Injectable, signal } from '@angular/core';

export type ScreenMode = 'normal' | 'overlay';

@Injectable({
  providedIn: 'root',
})
export class ScreenModeService {
  private modeSignal = signal<ScreenMode>('normal');
  private textOpacitySignal = signal<number>(0.7); // Default 70% opacity for text
  
  get mode() {
    return this.modeSignal.asReadonly();
  }

  get textOpacity() {
    return this.textOpacitySignal.asReadonly();
  }

  toggleMode() {
    const current = this.modeSignal();
    this.modeSignal.set(current === 'normal' ? 'overlay' : 'normal');
  }

  setMode(mode: ScreenMode) {
    this.modeSignal.set(mode);
  }

  setTextOpacity(opacity: number) {
    // Clamp between 0.1 and 1.0
    const clamped = Math.max(0.1, Math.min(1.0, opacity));
    this.textOpacitySignal.set(clamped);
  }

  increaseOpacity() {
    const current = this.textOpacitySignal();
    this.setTextOpacity(current + 0.1);
  }

  decreaseOpacity() {
    const current = this.textOpacitySignal();
    this.setTextOpacity(current - 0.1);
  }
}
