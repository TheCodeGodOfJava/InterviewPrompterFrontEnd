// transcript.component.ts
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { TranscriptService, TranscriptUpdate } from '../../service/TranscriptService';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [
    CommonModule,

    // Material imports
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,

    // CDK
    TextFieldModule,
  ],
  templateUrl: './transcript.component.html',
  styleUrl: './transcript.component.scss',
})
export class TranscriptComponent implements OnInit, OnDestroy {
  transcript: TranscriptUpdate = { fullText: '', version: 0, words: [] };
  isLoading = true;
  errorMessage: string | null = null;

  private subscription!: Subscription;

  constructor(private transcriptService: TranscriptService) {}

  ngOnInit(): void {
    // 1. Load initial transcript via HTTP
    this.transcriptService.loadInitialTranscript().subscribe({
      next: (data) => {
        this.transcript = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load initial transcript', err);
        this.errorMessage = 'Failed to load transcript. Trying live connection...';
        this.isLoading = false;
      },
    });

    // 2. Subscribe to live WebSocket updates
    this.subscription = this.transcriptService.transcript$.subscribe({
      next: (update) => {
        this.transcript = update;
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('WebSocket error', err);
        this.errorMessage = 'Live connection lost. Reconnecting...';
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get wordCount(): number {
    return this.transcript.words.length;
  }
}
