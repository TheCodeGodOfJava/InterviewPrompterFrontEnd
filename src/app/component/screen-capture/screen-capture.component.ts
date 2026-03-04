import { 
  Component, 
  ElementRef, 
  ViewChild, 
  OnDestroy, 
  ChangeDetectionStrategy,
  AfterViewInit,
  effect,
  DestroyRef,
  inject
} from '@angular/core';
import { ScreenCaptureService } from '../../service/screen-capture.service';

@Component({
  selector: 'app-screen-capture',
  templateUrl: './screen-capture.component.html',
  styleUrls: ['./screen-capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenCapture implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  private screenCaptureService = inject(ScreenCaptureService);
  private destroyRef = inject(DestroyRef);
  
  isCapturing = this.screenCaptureService.isCapturing;

  ngAfterViewInit() {
    // If there's already an active stream, attach it to the video element
    const existingStream = this.screenCaptureService.getMediaStream();
    if (existingStream && this.videoElement) {
      this.attachStreamToVideo(existingStream);
    }
  }

  async startCapture() {
    const stream = await this.screenCaptureService.startCapture();
    if (stream && this.videoElement) {
      this.attachStreamToVideo(stream);
    }
  }

  private attachStreamToVideo(stream: MediaStream) {
    if (!this.videoElement) return;
    
    this.videoElement.nativeElement.srcObject = stream;
    
    // Wait one tick for the [hidden] directive to be removed in the DOM
    setTimeout(async () => {
      try {
        await this.videoElement.nativeElement.play();
      } catch (playErr) {
        console.error('Failed to play video stream:', playErr);
      }
    }, 0);
  }

  stopCapture() {
    this.screenCaptureService.stopCapture();
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  ngOnDestroy() {
    // Don't stop the capture on destroy, just detach from video element
    // The service will keep the stream alive
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }
}