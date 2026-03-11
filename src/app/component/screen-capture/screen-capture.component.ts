import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ScreenCaptureService } from '../../service/screen-capture.service';

@Component({
  selector: 'app-screen-capture',
  templateUrl: './screen-capture.component.html',
  styleUrls: ['./screen-capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenCapture implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  private screenCaptureService = inject(ScreenCaptureService);
  isCapturing = this.screenCaptureService.isCapturing;

  async startCapture() {
    const stream = await this.screenCaptureService.startCapture();
    if (stream && this.videoElement) {
      this.attachStreamToVideo(stream);
    }
  }

  private attachStreamToVideo(stream: MediaStream) {
    if (!this.videoElement) return;

    this.videoElement.nativeElement.srcObject = stream;

    setTimeout(async () => {
      try {
        await this.videoElement.nativeElement.play();
      } catch (playErr) {
        console.error('Failed to play video stream:', playErr);
      }
    }, 0);
  }

  stopCapture() {
    this.screenCaptureService.stopCapture(); // This kills the actual hardware tracks
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null; // This clears the DOM memory
    }
  }

  // 👇 The safety net for memory leaks
  ngOnDestroy() {
    this.stopCapture();
  }
}