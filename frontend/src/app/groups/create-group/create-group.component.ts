import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../core/services/group.service';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
  selector: 'app-create-group',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss',
})
export class CreateGroupComponent {
  private fb = inject(FormBuilder);
  private groupService = inject(GroupService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get name() { return this.form.controls.name; }
  get password() { return this.form.controls.password; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.groupService.createGroup(this.form.getRawValue()).subscribe({
      next: (group) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/groups', group.id, 'manage']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'לא ניתן היה ליצור את הקבוצה.'));
      },
    });
  }
}
