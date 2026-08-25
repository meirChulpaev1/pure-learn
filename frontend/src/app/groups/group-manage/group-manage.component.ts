import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { GroupService } from '../../core/services/group.service';
import { VideoService } from '../../core/services/video.service';
import { GroupMember } from '../../core/models/group.model';
import { CreateVideoPayload, UpdateVideoPayload, Video } from '../../core/models/video.model';
import { extractErrorMessage } from '../../core/utils/error.util';
import { VideoListComponent } from '../../videos/video-list/video-list.component';
import { VideoFormComponent } from '../../videos/video-form/video-form.component';

@Component({
  selector: 'app-group-manage',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, VideoListComponent, VideoFormComponent],
  templateUrl: './group-manage.component.html',
  styleUrl: './group-manage.component.scss',
})
export class GroupManageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);
  private videoService = inject(VideoService);

  groupId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? undefined)));

  group = this.groupService.groupDetailResource(this.groupId);
  videos = this.videoService.videosResource(this.groupId);
  members = this.groupService.membersResource(this.groupId);

  // --- edit group details ---
  isEditingDetails = signal(false);
  detailsForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });
  detailsError = signal<string | null>(null);
  isSavingDetails = signal(false);

  startEditDetails(): void {
    const g = this.group.value();
    if (!g) return;
    this.detailsForm.setValue({ name: g.name, description: g.description });
    this.detailsError.set(null);
    this.isEditingDetails.set(true);
  }

  cancelEditDetails(): void {
    this.isEditingDetails.set(false);
  }

  saveDetails(): void {
    const id = this.groupId();
    if (!id || this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    this.isSavingDetails.set(true);
    this.detailsError.set(null);
    this.groupService.updateGroup(id, this.detailsForm.getRawValue()).subscribe({
      next: () => {
        this.isSavingDetails.set(false);
        this.isEditingDetails.set(false);
        this.group.reload();
      },
      error: (err) => {
        this.isSavingDetails.set(false);
        this.detailsError.set(extractErrorMessage(err, 'לא ניתן היה לשמור את השינויים.'));
      },
    });
  }

  // --- change password ---
  isChangingPassword = signal(false);
  passwordForm = this.fb.nonNullable.group({
    new_password: ['', [Validators.required, Validators.minLength(6)]],
  });
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);
  isSavingPassword = signal(false);

  savePassword(): void {
    const id = this.groupId();
    if (!id || this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isSavingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.groupService.changeGroupPassword(id, this.passwordForm.getRawValue()).subscribe({
      next: (res) => {
        this.isSavingPassword.set(false);
        this.passwordSuccess.set(res.detail);
        this.passwordForm.reset({ new_password: '' });
        this.isChangingPassword.set(false);
      },
      error: (err) => {
        this.isSavingPassword.set(false);
        this.passwordError.set(extractErrorMessage(err, 'לא ניתן היה לשנות את הסיסמה.'));
      },
    });
  }

  // --- videos ---
  isVideoFormOpen = signal(false);
  videoBeingEdited = signal<Video | null>(null);
  videoFormError = signal<string | null>(null);
  isSavingVideo = signal(false);

  openAddVideo(): void {
    this.videoBeingEdited.set(null);
    this.videoFormError.set(null);
    this.isVideoFormOpen.set(true);
  }

  openEditVideo(video: Video): void {
    this.videoBeingEdited.set(video);
    this.videoFormError.set(null);
    this.isVideoFormOpen.set(true);
  }

  closeVideoForm(): void {
    this.isVideoFormOpen.set(false);
    this.videoBeingEdited.set(null);
  }

  saveVideo(payload: CreateVideoPayload | UpdateVideoPayload): void {
    const id = this.groupId();
    if (!id) return;
    this.isSavingVideo.set(true);
    this.videoFormError.set(null);

    const editing = this.videoBeingEdited();
    const request = editing
      ? this.videoService.updateVideo(id, editing.id, payload)
      : this.videoService.addVideo(id, payload as CreateVideoPayload);

    request.subscribe({
      next: () => {
        this.isSavingVideo.set(false);
        this.closeVideoForm();
        this.videos.reload();
        this.group.reload();
      },
      error: (err) => {
        this.isSavingVideo.set(false);
        this.videoFormError.set(extractErrorMessage(err, 'לא ניתן היה לשמור את הסרטון.'));
      },
    });
  }

  deleteVideo(video: Video): void {
    const id = this.groupId();
    if (!id) return;
    if (!confirm(`למחוק את הסרטון "${video.title}"? הפעולה בלתי הפיכה.`)) return;

    this.videoService.deleteVideo(id, video.id).subscribe({
      next: () => {
        this.videos.reload();
        this.group.reload();
      },
      error: (err) => alert(extractErrorMessage(err, 'לא ניתן היה למחוק את הסרטון.')),
    });
  }

  // --- members ---
  membersError = signal<string | null>(null);

  removeMember(member: GroupMember): void {
    const id = this.groupId();
    if (!id) return;
    if (!confirm(`להסיר את ${member.user.username} מהקבוצה?`)) return;

    this.groupService.removeMember(id, member.user.id).subscribe({
      next: () => {
        this.members.reload();
        this.group.reload();
      },
      error: (err) => this.membersError.set(extractErrorMessage(err, 'לא ניתן היה להסיר את התלמיד.')),
    });
  }

  // --- delete group ---
  deleteGroupError = signal<string | null>(null);

  deleteGroup(): void {
    const id = this.groupId();
    const g = this.group.value();
    if (!id || !g) return;
    if (!confirm(`למחוק את הקבוצה "${g.name}" לצמיתות? כל הסרטונים והחברויות יימחקו.`)) return;

    this.groupService.deleteGroup(id).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => this.deleteGroupError.set(extractErrorMessage(err, 'לא ניתן היה למחוק את הקבוצה.')),
    });
  }
}
