import { describe, expect, it } from 'vitest';
import { toYoutubeEmbedUrl } from './video-embed.util';

describe('toYoutubeEmbedUrl', () => {
  it('converts a standard watch URL', () => {
    expect(toYoutubeEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123',
    );
  });

  it('converts a short youtu.be URL', () => {
    expect(toYoutubeEmbedUrl('https://youtu.be/xyz789')).toBe(
      'https://www.youtube-nocookie.com/embed/xyz789',
    );
  });

  it('converts a shorts URL', () => {
    expect(toYoutubeEmbedUrl('https://www.youtube.com/shorts/short1')).toBe(
      'https://www.youtube-nocookie.com/embed/short1',
    );
  });

  it('returns null for a non-youtube URL', () => {
    expect(toYoutubeEmbedUrl('https://example.com/video.mp4')).toBeNull();
  });

  it('returns null for an invalid URL string', () => {
    expect(toYoutubeEmbedUrl('not-a-url')).toBeNull();
  });
});
