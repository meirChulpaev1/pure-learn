import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoFormComponent } from './video-form.component';

describe('VideoFormComponent', () => {
  let fixture: ComponentFixture<VideoFormComponent>;
  let component: VideoFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VideoFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(VideoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not emit save when the url is invalid', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component['form'].setValue({ title: 'Intro', description: '', url: 'not-a-url' });
    component.submit();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('emits save with the form value when valid', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component['form'].setValue({
      title: 'Intro to Loops',
      description: 'basics',
      url: 'https://youtu.be/abc123',
    });
    component.submit();

    expect(saveSpy).toHaveBeenCalledWith({
      title: 'Intro to Loops',
      description: 'basics',
      url: 'https://youtu.be/abc123',
    });
  });

  it('emits cancel when the cancel button is clicked', () => {
    const cancelSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);

    const cancelBtn = fixture.debugElement.query(By.css('button[type="button"]'));
    cancelBtn.nativeElement.click();

    expect(cancelSpy).toHaveBeenCalled();
  });
});
