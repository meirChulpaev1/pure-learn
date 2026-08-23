import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../environments/environment';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('renders teaching groups under the "מלמד/ת" section', () => {
    fixture.detectChanges();

    httpMock
      .expectOne(`${environment.apiUrl}/groups/my-teaching/`)
      .flush([{ id: 'g1', name: 'Python Beginners', description: '', created_at: 'now', videos_count: 2, members_count: 5 }]);
    httpMock.expectOne(`${environment.apiUrl}/groups/my-student/`).flush([]);

    fixture.detectChanges();

    const cardTitles = fixture.debugElement
      .queryAll(By.css('.card--teach h3'))
      .map((el) => el.nativeElement.textContent.trim());
    expect(cardTitles).toContain('Python Beginners');
  });

  it('shows an empty state when the student groups list is empty', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/groups/my-teaching/`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/groups/my-student/`).flush([]);
    fixture.detectChanges();

    const emptyStates = fixture.debugElement.queryAll(By.css('.empty-state'));
    expect(emptyStates.length).toBe(2);
  });
});
