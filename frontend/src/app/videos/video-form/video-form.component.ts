import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateVideoPayload, Video } from '../../core/models/video.model';

@Component({
  selector: 'app-video-form',
  imports: [ReactiveFormsModule],
  templateUrl: './video-form.component.html',
  styleUrl: './video-form.component.scss',
})
export class VideoFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  /** אם קיים — הטופס בעריכה, ה-inputs נטענים מהוידאו הקיים. */
  video = input<Video | null>(null);
  submitting = input(false);

  save = output<CreateVideoPayload>();
  cancel = output<void>();

  protected form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  ngOnInit(): void {
    // inputs מובטחים להיות מוגדרים ב-ngOnInit (בשונה מ-field initializer שרץ לפני שהם נקשרים).
    const existing = this.video();
    if (existing) {
      this.form.setValue({
        title: existing.title,
        description: existing.description,
        url: existing.url,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}
