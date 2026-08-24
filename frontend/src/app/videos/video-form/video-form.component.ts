import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateVideoPayload, UpdateVideoPayload, Video } from '../../core/models/video.model';

@Component({
  selector: 'app-video-form',
  imports: [ReactiveFormsModule],
  templateUrl: './video-form.component.html',
  styleUrl: './video-form.component.scss',
})
export class VideoFormComponent {
  private fb = inject(FormBuilder);

  /** אם קיים — הטופס במצב עריכה. אם ריק/undefined — מצב הוספה. */
  videoToEdit = input<Video | null>(null);
  isSaving = input(false);
  errorMessage = input<string | null>(null);

  save = output<CreateVideoPayload | UpdateVideoPayload>();
  cancel = output<void>();

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  constructor() {
    // כשה-input videoToEdit משתנה (למשל: לוחצים "עריכה" על סרטון אחר), ממלאים את הטופס מחדש.
    effect(() => {
      const video = this.videoToEdit();
      if (video) {
        this.form.setValue({
          title: video.title,
          description: video.description,
          url: video.url,
        });
      } else {
        this.form.reset({ title: '', description: '', url: '' });
      }
    });
  }

  get title() { return this.form.controls.title; }
  get url() { return this.form.controls.url; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
