import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AudioService } from "../../service/audio-service";


@Component({
  selector: 'app-recognition-control',
  standalone: true,
  imports: [MatSlideToggle, MatIcon, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recognition-control.component.html',
  styleUrl: './recognition-control.component.scss',
})
export class RecognitionControlComponent {
  audioService = inject(AudioService);

  onToggle(enabled: boolean) {
    this.audioService.toggleRecognition(enabled).subscribe(status => {
      this.audioService.isRecognitionActive.set(status);
    });
  }
}