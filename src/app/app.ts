import { Component } from '@angular/core';
import { ChatComponent } from './component/chat/chat.component';
import { AiAnswerComponent } from "./component/answer/answer.component";
import { AudioSourceControlsComponent } from "./component/audio-source-controls/audio-source-controls.component";
import { ScreenCapture } from "./component/screen-capture/screen-capture.component";
import { ScreenModeService } from './service/screen-mode.service';
import { ChatService } from './service/chat-service';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [ChatComponent, AiAnswerComponent, AudioSourceControlsComponent, ScreenCapture],
})
export class App {
  private destroyRef = inject(DestroyRef);
  
  protected screenMode = inject(ScreenModeService).mode;
  protected videoOpacity = inject(ScreenModeService).textOpacity;

  constructor(
    private screenModeService: ScreenModeService,
    private chatService: ChatService
  ) {
    this.chatService.screenModeToggle$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.screenModeService.toggleMode();
      });

    this.chatService.videoOpacityChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => {
        if (action === 'increase') {
          this.screenModeService.increaseOpacity();
        } else {
          this.screenModeService.decreaseOpacity();
        }
      });
  }
}
