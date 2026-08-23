import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    const { username, password } = this.form.getRawValue();

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        // אחרי הרשמה מוצלחת מתחברים אוטומטית כדי לחסוך מסך נוסף.
        this.auth.login({ username, password }).subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.submitting.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(this.mapError(err));
      },
    });
  }

  private mapError(err: HttpErrorResponse): string {
    const body = err.error as Record<string, string[]> | undefined;
    if (body?.['username']) return 'שם המשתמש הזה כבר תפוס.';
    if (body?.['email']) return 'כתובת האימייל הזו כבר בשימוש.';
    if (body?.['password']) return 'הסיסמה אינה עומדת בדרישות האורך.';
    return 'שגיאה בהרשמה. נסו שוב.';
  }
}
