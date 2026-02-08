import { Component } from '@angular/core';
import { ChatComponent } from './component/chat/chat.component';
import { AiAnswerComponent } from "./component/answer/answer.component";
import { AudioSourceControlsComponent } from "./component/audio-source-controls/audio-source-controls.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [ChatComponent, AiAnswerComponent, AudioSourceControlsComponent],
})
export class App {}
