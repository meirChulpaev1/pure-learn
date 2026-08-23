import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('does not submit when the form is invalid', () => {
    component.submit();
    httpMock.expectNone(`${environment.apiUrl}/auth/login/`);
    expect(component['form'].touched).toBe(true);
  });

  it('navigates to /dashboard after a successful login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component['form'].setValue({ username: 'meir', password: 'secret123' });

    component.submit();

    httpMock
      .expectOne(`${environment.apiUrl}/auth/login/`)
      .flush({ access: 'a', refresh: 'r' });
    httpMock
      .expectOne(`${environment.apiUrl}/auth/me/`)
      .flush({ id: 1, username: 'meir', email: 'meir@example.com' });

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('shows a generic Hebrew error message on invalid credentials (401)', () => {
    component['form'].setValue({ username: 'meir', password: 'wrong' });
    component.submit();

    httpMock
      .expectOne(`${environment.apiUrl}/auth/login/`)
      .flush({ detail: 'invalid' }, { status: 401, statusText: 'Unauthorized' });

    expect(component['errorMessage']()).toBe('שם משתמש או סיסמה שגויים.');
  });
});
