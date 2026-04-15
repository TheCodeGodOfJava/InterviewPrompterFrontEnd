import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, computed, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
})
export class LanguageSelectorComponent {
  currentLang = signal<'BILINGUAL' | 'ENGLISH'>('BILINGUAL');
  isEnglish = computed(() => this.currentLang() === 'ENGLISH');

  constructor(private http: HttpClient) {
    this.http.get<string>('http://localhost:8080/api/chat/language')
      .subscribe(lang => this.currentLang.set(lang as any));
  }

  toggleLanguage() {
    const next = this.isEnglish() ? 'BILINGUAL' : 'ENGLISH';
    this.http.post('http://localhost:8080/api/chat/language', null, { params: { lang: next }, responseType: 'text' })
      .subscribe(() => this.currentLang.set(next as any));
  }
}