import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Group } from '../../core/models/group.model';
import { Video } from '../../core/models/video.model';
import { GroupService } from '../../core/services/group.service';
import { VideoService } from '../../core/services/video.service';
import { VideoPlayerComponent } from '../../videos/video-player/video-player.component';

@Component({
  selector: 'app-group-view',
  imports: [RouterLink, VideoPlayerComponent],
  templateUrl: './group-view.component.html',
  styleUrl: './group-view.component.scss',
})
export class GroupViewComponent implements OnInit {
  // מקושר אוטומטית מפרמטר הנתיב `:id`.
  id = input.required<string>();

  private groupService = inject(GroupService);
  private videoService = inject(VideoService);

  protected readonly group = signal<Group | null>(null);
  protected readonly videos = signal<Video[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    const groupId = this.id();
    this.loading.set(true);

    this.groupService.getGroup(groupId).subscribe({
      next: (group) => {
        this.group.set(group);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // 403/404 — לרוב כי המשתמש אינו Owner/Member של הקבוצה הזו.
        this.loadError.set('אין לכם גישה לקבוצה זו, או שהיא לא קיימת.');
      },
    });

    this.videoService.list(groupId).subscribe({
      next: (videos) => this.videos.set(videos),
    });
  }
}
