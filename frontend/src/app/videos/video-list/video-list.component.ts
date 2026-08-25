import { Component, input, output, signal } from '@angular/core';
import { Video } from '../../core/models/video.model';
import { VideoPlayerComponent } from '../video-player/video-player.component';

@Component({
  selector: 'app-video-list',
  imports: [VideoPlayerComponent],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss',
})
export class VideoListComponent {
  videos = input.required<Video[]>();
  /** true במסך הניהול (Owner) — מציג כפתורי עריכה/מחיקה. false במסך הצפייה (Member). */
  canManage = input(false);

  edit = output<Video>();
  delete = output<Video>();

  private _expandedId = signal<number | null>(null);

  isExpanded(video: Video): boolean {
    return this._expandedId() === video.id;
  }

  toggle(video: Video): void {
    this._expandedId.set(this.isExpanded(video) ? null : video.id);
  }

  onEdit(event: Event, video: Video): void {
    event.stopPropagation();
    this.edit.emit(video);
  }

  onDelete(event: Event, video: Video): void {
    event.stopPropagation();
    this.delete.emit(video);
  }
}
