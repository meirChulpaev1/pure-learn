/**
 * הופך URL של יוטיוב (או קישור רגיל) לכתובת embed להצגה בתוך iframe.
 * אם ה-URL אינו יוטיוב מזוהה, מוחזר null — הרכיב יציג קישור רגיל במקום נגן מוטמע.
 */
export function toYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;

      const shortsMatch = parsed.pathname.match(/^\/shorts\/([\w-]+)/);
      if (shortsMatch) return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`;
    }

    return null;
  } catch {
    return null;
  }
}
