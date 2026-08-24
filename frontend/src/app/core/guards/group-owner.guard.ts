import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { GroupService } from '../services/group.service';

/**
 * חוסם ניווט למסך ניהול קבוצה (/groups/:id/manage) אם המשתמש אינו ה-Owner שלה.
 * זו נוחות UX בלבד — הפניה מהירה למסך הצפייה במקום מסך שגיאה.
 * ההגנה האמיתית תמיד בשרת (IsGroupOwner permission class ב-Django), ראו core docs.
 */
export const groupOwnerGuard: CanActivateFn = (route) => {
  const groupService = inject(GroupService);
  const router = inject(Router);
  const groupId = route.paramMap.get('id');

  if (!groupId) {
    return router.createUrlTree(['/dashboard']);
  }

  return groupService.getGroupDetail(groupId).pipe(
    map((group) => (group.is_owner ? true : router.createUrlTree(['/groups', groupId, 'view']))),
    catchError(() => of(router.createUrlTree(['/dashboard']))),
  );
};
