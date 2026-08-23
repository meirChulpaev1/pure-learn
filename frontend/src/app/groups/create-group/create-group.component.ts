import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../core/services/group.service';

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

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.groupService.createGroup(this.form.getRawValue()).subscribe({
      next: (group) => {
        this.groupService.myTeachingGroups.reload();
        this.router.navigate(['/groups', group.id, 'manage']);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('לא הצלחנו ליצור את הקבוצה. ודאו שכל השדות תקינים ונסו שוב.');
      },
    });
  }
}
