import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, TemplateRef, ViewChild, effect, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatService } from '../../service/chat-service';
import { RecognitionControlComponent } from "../recognition-control/recognition-control.component";
import { LanguageSelectorComponent } from "../language-selector/language-selector.component";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MarkdownComponent,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    RecognitionControlComponent,
    LanguageSelectorComponent
],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnDestroy {
  private readonly scrollContainer = viewChild<ElementRef>('scrollContainer');

  @ViewChild('universalDialog') universalDialog!: TemplateRef<void>;
  private observer?: MutationObserver;
  private dialog = inject(MatDialog);

  protected messages;

  protected dialogTitle = '';
  protected dialogMessage = '';

  constructor(protected chatService: ChatService) {
    this.messages = this.chatService.messages;

    effect(() => {
      const container = this.scrollContainer(); // Сигнал контейнера
      const messagesExist = this.messages().length > 0;

      if (container && messagesExist) {
        this.setupScrollObserver(container.nativeElement);
      }
    });
  }

  private setupScrollObserver(element: HTMLElement) {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      this.scrollToBottom();
    });

    this.observer.observe(element, {
      childList: true,
      subtree: true
    });
    this.scrollToBottom();
  }

  isImage(content: string): boolean {
    return !!content && content.startsWith('data:image/');
  }

  scrollToBottom(): void {
    const container = this.scrollContainer();
    if (container) {
      const el = container.nativeElement;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'auto'
      });
    }
  }

  private confirmAction(title: string, message: string, action: () => void) {
    this.dialogTitle = title;
    this.dialogMessage = message;

    this.dialog.open(this.universalDialog, {
      width: '350px'
    }).afterClosed().subscribe(result => {
      if (result === true) {
        action();
      }
    });
  }

  confirmDeleteUpTo(messageId: string) {
    this.confirmAction(
      'Delete history?',
      'This will remove this message and all messages above it.',
      () => this.chatService.deleteUpToMessage(messageId)
    );
  }

  confirmTotalClear() {
    this.confirmAction(
      'Total Reset?',
      'This will wipe EVERYTHING: chat history, screenshots, and AI analysis state. Proceed?',
      () => this.chatService.clearAllHistory()
    );
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}


