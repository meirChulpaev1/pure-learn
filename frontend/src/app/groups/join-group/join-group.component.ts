import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../core/services/group.service';

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

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected form = this.fb.nonNullable.group({
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.groupService.joinGroup(this.form.getRawValue()).subscribe({
      next: (group) => {
        this.groupService.myStudentGroups.reload();
        this.router.navigate(['/groups', group.id, 'view']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        // בכוונה הודעה גנרית — השרת לא חושף אילו קבוצות קיימות (ראו מסמך התכנון סעיף 10).
        this.errorMessage.set(
          err.status === 400 ? (err.error?.detail ?? 'סיסמה שגויה.') : 'שגיאה בהצטרפות לקבוצה.',
        );
      },
    });
  }
}
