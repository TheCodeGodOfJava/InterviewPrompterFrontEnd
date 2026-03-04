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
      // Already capturing, return existing stream
      return this.mediaStream;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false 
      });

      this.isCapturing.set(true);

      // Automatically switch to overlay mode after selecting screen
      this.screenModeService.setMode('overlay');

      // Refocus the app window after a short delay
      setTimeout(() => {
        window.focus();
        // Try to bring the window to front
        if (document.hasFocus()) {
          console.log('App window refocused');
        }
      }, 100);

      // Listen for when user stops sharing via browser UI
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
    
    // Switch back to normal mode when capture stops
    this.screenModeService.setMode('normal');
  }
}
