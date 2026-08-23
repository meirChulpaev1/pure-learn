import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toYoutubeEmbedUrl } from '../../core/utils/video-embed.util';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent {
  private sanitizer = inject(DomSanitizer);

  url = input.required<string>();
  title = input<string>('');

  // רק כתובות youtube-nocookie.com שנבנו על ידינו (toYoutubeEmbedUrl) מגיעות לכאן — לא URL חופשי מהמשתמש.
  protected embedUrl = computed<SafeResourceUrl | null>(() => {
    const raw = toYoutubeEmbedUrl(this.url());
    return raw ? this.sanitizer.bypassSecurityTrustResourceUrl(raw) : null;
  });
}
