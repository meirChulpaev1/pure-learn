import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { GroupService } from '../../core/services/group.service';
import { VideoService } from '../../core/services/video.service';
import { VideoListComponent } from '../../videos/video-list/video-list.component';

@Component({
  selector: 'app-group-view',
  imports: [DatePipe, VideoListComponent],
  templateUrl: './group-view.component.html',
  styleUrl: './group-view.component.scss',
})
export class GroupViewComponent {
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  private videoService = inject(VideoService);

  groupId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? undefined)));

  group = this.groupService.groupDetailResource(this.groupId);
  videos = this.videoService.videosResource(this.groupId);
}
