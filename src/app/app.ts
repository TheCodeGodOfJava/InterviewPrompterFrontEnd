import { Component } from '@angular/core';
import { TranscriptComponent } from './component/transcript/transcript.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [TranscriptComponent],
})
export class App {}
