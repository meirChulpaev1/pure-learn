import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { VideoPlayerComponent } from './video-player.component';

describe('VideoPlayerComponent', () => {
  let fixture: ComponentFixture<VideoPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VideoPlayerComponent] }).compileComponents();
    fixture = TestBed.createComponent(VideoPlayerComponent);
  });

  it('renders an iframe for a recognised YouTube URL', () => {
    fixture.componentRef.setInput('url', 'https://www.youtube.com/watch?v=abc123');
    fixture.detectChanges();

    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe).toBeTruthy();
  });

  it('falls back to a plain link for a non-YouTube URL', () => {
    fixture.componentRef.setInput('url', 'https://example.com/video.mp4');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('iframe'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('a'))).toBeTruthy();
  });
});
