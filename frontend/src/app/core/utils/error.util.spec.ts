import { describe, expect, it } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { extractErrorMessage } from './error.util';

describe('extractErrorMessage', () => {
  it('returns a connection message for status 0 (server unreachable)', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(extractErrorMessage(error)).toBe('לא ניתן להתחבר לשרת. ודא שה-Backend פעיל.');
  });

  it('extracts a top-level "detail" message', () => {
    const error = new HttpErrorResponse({ status: 403, error: { detail: 'רק בעל הקבוצה רשאי לבצע פעולה זו.' } });
    expect(extractErrorMessage(error)).toBe('רק בעל הקבוצה רשאי לבצע פעולה זו.');
  });

  it('extracts the first message from a field-specific validation error array', () => {
    const error = new HttpErrorResponse({ status: 400, error: { username: ['שם המשתמש כבר תפוס.'] } });
    expect(extractErrorMessage(error)).toBe('שם המשתמש כבר תפוס.');
  });

  it('falls back to the provided default when the shape is unrecognized', () => {
    const error = new HttpErrorResponse({ status: 500, error: {} });
    expect(extractErrorMessage(error, 'ברירת מחדל')).toBe('ברירת מחדל');
  });

  it('falls back to the default for non-HttpErrorResponse values', () => {
    expect(extractErrorMessage(new Error('generic'), 'ברירת מחדל')).toBe('ברירת מחדל');
  });
});
