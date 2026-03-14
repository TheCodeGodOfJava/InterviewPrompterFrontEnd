import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, ViewChild, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatService } from '../../service/chat-service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
    MatDialogModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<void>;
  private dialog = inject(MatDialog);

  protected messages;

  constructor(protected chatService: ChatService) {
    this.messages = this.chatService.messages;
    // Auto-scroll effect: Whenever messages change, scroll to bottom
    effect(() => {
      if (this.messages.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  isImage(content: string): boolean {
    return !!content && content.startsWith('data:image/');
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
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
}
