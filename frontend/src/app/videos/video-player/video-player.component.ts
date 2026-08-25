import { Component, computed, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { Video } from '../../core/models/video.model';
import { toYouTubeEmbedUrl } from '../../core/utils/youtube.util';

@Component({
  selector: 'app-video-player',
  imports: [],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent {
  private sanitizer = inject(DomSanitizer);

  video = input.required<Video>();

  embedUrl = computed<SafeResourceUrl | null>(() => {
    const raw = toYouTubeEmbedUrl(this.video().url);
    return raw ? this.sanitizer.bypassSecurityTrustResourceUrl(raw) : null;
  });
}
