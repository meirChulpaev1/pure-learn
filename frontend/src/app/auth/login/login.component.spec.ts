import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authServiceMock: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('does not call the API when the form is invalid (empty fields)', () => {
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component.username.touched).toBe(true);
    expect(component.password.touched).toBe(true);
  });

  it('calls AuthService.login with the form values and navigates on success', () => {
    const fakeUser: User = { id: 1, username: 'meir', email: 'meir@example.com', date_joined: '2026-01-01' };
    authServiceMock.login.mockReturnValue(of(fakeUser));

    component.form.setValue({ username: 'meir', password: 'StrongPass123!' });
    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({ username: 'meir', password: 'StrongPass123!' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(component.isSubmitting()).toBe(false);
  });

  it('shows an error message when login fails', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { detail: 'שם משתמש או סיסמה שגויים.' } })),
    );

    component.form.setValue({ username: 'meir', password: 'wrong' });
    component.onSubmit();

    expect(component.errorMessage()).toBe('שם משתמש או סיסמה שגויים.');
    expect(component.isSubmitting()).toBe(false);
  });
});
