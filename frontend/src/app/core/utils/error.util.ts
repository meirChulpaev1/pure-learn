import { HttpErrorResponse } from '@angular/common/http';

/**
 * DRF מחזיר שגיאות בכמה צורות אפשריות:
 *  - { detail: "הודעה" }                          (permission denied / not found / throttled)
 *  - { field_name: ["הודעה1", "הודעה2"] }          (ValidationError על שדה ספציפי)
 *  - { non_field_errors: ["הודעה"] }               (ValidationError כללי)
 * הפונקציה הזו ממירה כל אחת מהצורות להודעת טקסט אחת קריאה למשתמש.
 */
export function extractErrorMessage(error: unknown, fallback = 'אירעה שגיאה. נסה שוב.'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'לא ניתן להתחבר לשרת. ודא שה-Backend פעיל.';
  }

  const body = error.error;

  if (typeof body === 'string') {
    return body;
  }

  if (body && typeof body === 'object') {
    if (typeof body.detail === 'string') {
      return body.detail;
    }

    const firstKey = Object.keys(body)[0];
    if (firstKey) {
      const value = body[firstKey];
      const message = Array.isArray(value) ? value[0] : value;
      if (typeof message === 'string') {
        return message;
      }
    }
  }

  return fallback;
}
