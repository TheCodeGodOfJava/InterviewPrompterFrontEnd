import { Component } from '@angular/core';
import { TranscriptComponent } from './component/transcript/transcript.component';
import { AiAnswerComponent } from "./component/answer/answer.component";
import { AudioSourceControlsComponent } from "./component/audio-source-controls/audio-source-controls.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [TranscriptComponent, AiAnswerComponent, AudioSourceControlsComponent],
})
export class App {}
