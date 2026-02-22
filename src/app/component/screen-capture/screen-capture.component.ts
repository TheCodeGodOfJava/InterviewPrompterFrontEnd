import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  signal 
} from '@angular/core';

@Component({
  selector: 'app-screen-capture',
  templateUrl: './screen-capture.component.html',
  styleUrls: ['./screen-capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Added OnPush
})
export class ScreenCapture implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  // Converted to a reactive Signal
  isCapturing = signal(false); 
  private mediaStream: MediaStream | null = null;

  async startCapture() {
    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false 
      });

      this.videoElement.nativeElement.srcObject = this.mediaStream;
      
      // Setting the signal automatically marks the view for checking
      this.isCapturing.set(true);

      // Wait one tick for the [hidden] directive to be removed in the DOM
      setTimeout(async () => {
        try {
          await this.videoElement.nativeElement.play();
        } catch (playErr) {
          console.error('Failed to play video stream:', playErr);
        }
      }, 0);

      this.mediaStream.getVideoTracks()[0].onended = () => {
        this.stopCapture();
      };
    } catch (err) {
      console.error('Screen capture was canceled or failed:', err);
    }
  }

  stopCapture() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
    
    // Setting the signal back updates the UI instantly
    this.isCapturing.set(false);
  }

  ngOnDestroy() {
    this.stopCapture();
  }
}