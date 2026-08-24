/**
 * מזהה קישורי YouTube נפוצים (watch?v=, youtu.be/, shorts/, embed/) ומחזיר כתובת embed.
 * אם ה-URL אינו מזוהה כ-YouTube — מחזיר null, וה-UI יציג קישור פתיחה רגיל במקום נגן מוטמע.
 */
export function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    let videoId: string | null = null;

    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2];
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2];
      }
    }

    if (!videoId) return null;

    videoId = videoId.split('&')[0].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
