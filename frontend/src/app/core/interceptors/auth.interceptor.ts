import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * מצרף "Authorization: Bearer <token>" לכל בקשה יוצאת אל ה-API שלנו.
 * אם השרת מחזיר 401 (access token פג תוקף) — מנסה לרענן פעם אחת עם ה-refresh token,
 * ואם זה מצליח שולח מחדש את הבקשה המקורית עם הטוקן החדש.
 * אם הרענון נכשל — מתנתק ומפנה למסך ההתחברות.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const isAuthEndpoint = req.url.includes('/auth/login/') || req.url.includes('/auth/register/') || req.url.includes('/auth/refresh/');

  const token = auth.accessToken();
  const authorizedReq = token && isApiRequest && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      const shouldTryRefresh =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !isAuthEndpoint &&
        auth.getRefreshToken() !== null;

      if (!shouldTryRefresh) {
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((res) => {
          const retriedReq = req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` } });
          return next(retriedReq);
        }),
        catchError((refreshError) => {
          auth.clearTokens();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
