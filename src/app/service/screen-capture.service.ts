import { Injectable, signal, inject } from '@angular/core';
import { ScreenModeService } from './screen-mode.service';

@Injectable({
  providedIn: 'root',
})
export class ScreenCaptureService {
  private mediaStream: MediaStream | null = null;
  private screenModeService = inject(ScreenModeService);

  isCapturing = signal(false);

  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  async startCapture(): Promise<MediaStream | null> {
    if (this.mediaStream) {
      return this.mediaStream;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      this.isCapturing.set(true);

      this.screenModeService.setMode('overlay');

      setTimeout(() => {
        window.focus();
        if (document.hasFocus()) {
          console.log('App window refocused');
        }
      }, 100);

      this.mediaStream.getVideoTracks()[0].onended = () => {
        this.stopCapture();
      };

      return this.mediaStream;
    } catch (err) {
      console.error('Screen capture was canceled or failed:', err);
      return null;
    }
  }

  stopCapture() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isCapturing.set(false);
    this.screenModeService.setMode('normal');
  }
}
