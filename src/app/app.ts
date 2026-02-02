import { Component } from '@angular/core';
import { TranscriptComponent } from './component/transcript/transcript.component';
import { AiAnswerComponent } from "./component/answer/answer.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [TranscriptComponent, AiAnswerComponent],
})
export class App {}
