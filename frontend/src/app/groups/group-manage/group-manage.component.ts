import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Group, GroupMember } from '../../core/models/group.model';
import { CreateVideoPayload, Video } from '../../core/models/video.model';
import { GroupService } from '../../core/services/group.service';
import { VideoService } from '../../core/services/video.service';
import { VideoFormComponent } from '../../videos/video-form/video-form.component';
import { VideoPlayerComponent } from '../../videos/video-player/video-player.component';

@Component({
  selector: 'app-group-manage',
  imports: [ReactiveFormsModule, RouterLink, VideoFormComponent, VideoPlayerComponent],
  templateUrl: './group-manage.component.html',
  styleUrl: './group-manage.component.scss',
})
export class GroupManageComponent implements OnInit {
  // מקושר אוטומטית מפרמטר הנתיב `:id` (withComponentInputBinding ב-app.config.ts).
  id = input.required<string>();

  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);
  private videoService = inject(VideoService);
  private router = inject(Router);

  protected readonly group = signal<Group | null>(null);
  protected readonly videos = signal<Video[]>([]);
  protected readonly members = signal<GroupMember[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected readonly editingInfo = signal(false);
  protected readonly changingPassword = signal(false);
  protected readonly addingVideo = signal(false);
  protected readonly editingVideoId = signal<number | null>(null);
  protected readonly savingVideo = signal(false);

  protected infoForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  protected passwordForm = this.fb.nonNullable.group({
    new_password: ['', [Validators.required, Validators.minLength(4)]],
  });

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.loading.set(true);
    this.loadError.set(null);
    const groupId = this.id();

    this.groupService.getGroup(groupId).subscribe({
      next: (group) => {
        this.group.set(group);
        this.infoForm.setValue({ name: group.name, description: group.description });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set('לא הצלחנו לטעון את פרטי הקבוצה.');
      },
    });

    this.videoService.list(groupId).subscribe({ next: (v) => this.videos.set(v) });
    this.groupService.getMembers(groupId).subscribe({ next: (m) => this.members.set(m) });
  }

  saveInfo(): void {
    if (this.infoForm.invalid) return;
    this.groupService.updateGroup(this.id(), this.infoForm.getRawValue()).subscribe({
      next: (group) => {
        this.group.set(group);
        this.groupService.myTeachingGroups.reload();
        this.editingInfo.set(false);
      },
      error: () => this.actionError.set('עדכון פרטי הקבוצה נכשל.'),
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.groupService.changePassword(this.id(), this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
      },
      error: () => this.actionError.set('שינוי הסיסמה נכשל.'),
    });
  }

  deleteGroup(): void {
    const group = this.group();
    if (!group) return;
    const confirmed = confirm(`למחוק לצמיתות את הקבוצה "${group.name}"? הפעולה אינה הפיכה.`);
    if (!confirmed) return;

    this.groupService.deleteGroup(this.id()).subscribe({
      next: () => {
        this.groupService.myTeachingGroups.reload();
        this.router.navigate(['/dashboard']);
      },
      error: () => this.actionError.set('מחיקת הקבוצה נכשלה.'),
    });
  }

  removeMember(member: GroupMember): void {
    const confirmed = confirm(`להסיר את ${member.username} מהקבוצה?`);
    if (!confirmed) return;

    this.groupService.removeMember(this.id(), member.id).subscribe({
      next: () => this.members.set(this.members().filter((m) => m.id !== member.id)),
      error: () => this.actionError.set('הסרת החבר נכשלה.'),
    });
  }

  createVideo(payload: CreateVideoPayload): void {
    this.savingVideo.set(true);
    this.videoService.create(this.id(), payload).subscribe({
      next: (video) => {
        this.videos.set([video, ...this.videos()]);
        this.groupService.myTeachingGroups.reload();
        this.addingVideo.set(false);
        this.savingVideo.set(false);
      },
      error: () => {
        this.savingVideo.set(false);
        this.actionError.set('הוספת הסרטון נכשלה.');
      },
    });
  }

  updateVideo(video: Video, payload: CreateVideoPayload): void {
    this.savingVideo.set(true);
    this.videoService.update(this.id(), video.id, payload).subscribe({
      next: (updated) => {
        this.videos.set(this.videos().map((v) => (v.id === updated.id ? updated : v)));
        this.editingVideoId.set(null);
        this.savingVideo.set(false);
      },
      error: () => {
        this.savingVideo.set(false);
        this.actionError.set('עדכון הסרטון נכשל.');
      },
    });
  }

  deleteVideo(video: Video): void {
    const confirmed = confirm(`למחוק את הסרטון "${video.title}"?`);
    if (!confirmed) return;

    this.videoService.remove(this.id(), video.id).subscribe({
      next: () => {
        this.videos.set(this.videos().filter((v) => v.id !== video.id));
        this.groupService.myTeachingGroups.reload();
      },
      error: () => this.actionError.set('מחיקת הסרטון נכשלה.'),
    });
  }
}
