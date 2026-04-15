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
    RecognitionControlComponent
],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnDestroy {
  private readonly scrollContainer = viewChild<ElementRef>('scrollContainer');

  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<void>;
  private observer?: MutationObserver;
  private dialog = inject(MatDialog);

  protected messages;

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

  confirmDeleteUpTo(messageId: string) {
    this.dialog.open(this.deleteDialog, {
      width: '300px'
    }).afterClosed().subscribe(result => {
      if (result === true) {
        this.chatService.deleteUpToMessage(messageId);
      }
    });

  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}


