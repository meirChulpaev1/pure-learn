import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
  selector: 'app-join-group',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './join-group.component.html',
  styleUrl: './join-group.component.scss',
})
export class JoinGroupComponent {
  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required]],
  });

  get password() { return this.form.controls.password; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.groupService.joinGroup(this.form.getRawValue().password).subscribe({
      next: (group) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/groups', group.id, 'view']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'סיסמה שגויה.'));
      },
    });
  }
}
