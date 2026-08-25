import { describe, expect, it } from 'vitest';
import { toYouTubeEmbedUrl } from './youtube.util';

describe('toYouTubeEmbedUrl', () => {
  it('converts a standard watch URL', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('converts a shortened youtu.be URL', () => {
    expect(toYouTubeEmbedUrl('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123');
  });

  it('converts a Shorts URL', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/shorts/abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('passes through an already-embedded URL', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/embed/abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('strips extra query params after the video id', () => {
    expect(toYouTubeEmbedUrl('https://www.youtube.com/watch?v=abc123&t=30s')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('returns null for a non-YouTube URL', () => {
    expect(toYouTubeEmbedUrl('https://vimeo.com/123456')).toBeNull();
  });

  it('returns null for a malformed URL instead of throwing', () => {
    expect(toYouTubeEmbedUrl('not-a-url')).toBeNull();
  });
});
