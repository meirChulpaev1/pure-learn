import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { VideoListComponent } from './video-list.component';
import { Video } from '../../core/models/video.model';

const sampleVideos: Video[] = [
  {
    id: 1,
    title: 'Python Variables',
    description: 'מבוא למשתנים',
    url: 'https://www.youtube.com/watch?v=abc123',
    created_at: '2026-01-01T00:00:00Z',
    uploader_username: 'meir',
    group: 'group-1',
  },
  {
    id: 2,
    title: 'Python Functions',
    description: '',
    url: 'https://www.youtube.com/watch?v=def456',
    created_at: '2026-01-02T00:00:00Z',
    uploader_username: 'meir',
    group: 'group-1',
  },
];

describe('VideoListComponent', () => {
  let fixture: ComponentFixture<VideoListComponent>;
  let component: VideoListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('videos', sampleVideos);
    fixture.detectChanges();
  });

  it('renders one row per video', () => {
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="video-row"]');
    expect(rows.length).toBe(2);
  });

  it('does not show manage actions by default (canManage=false)', () => {
    const editButtons = fixture.nativeElement.querySelectorAll('[data-testid="edit-video"]');
    expect(editButtons.length).toBe(0);
  });

  it('shows edit/delete actions when canManage=true, and emits on click', () => {
    fixture.componentRef.setInput('canManage', true);
    fixture.detectChanges();

    let emittedVideo: Video | undefined;
    component.edit.subscribe((v) => (emittedVideo = v));

    const editButton: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="edit-video"]');
    expect(editButton).toBeTruthy();
    editButton.click();

    expect(emittedVideo?.id).toBe(1);
  });

  it('toggles expanded state when a video row is clicked', () => {
    expect(component.isExpanded(sampleVideos[0])).toBe(false);
    component.toggle(sampleVideos[0]);
    expect(component.isExpanded(sampleVideos[0])).toBe(true);
    component.toggle(sampleVideos[0]);
    expect(component.isExpanded(sampleVideos[0])).toBe(false);
  });
});
