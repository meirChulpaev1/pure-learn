import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GroupService } from '../services/group.service';

/**
 * נוחות UX בלבד — הפניה מהירה אם המשתמש בכל זאת אינו Owner.
 * האכיפה האמיתית תמיד בשרת (IsGroupOwner / has_object_permission), ולעולם לא כאן.
 */
export const groupOwnerGuard: CanActivateFn = async (route) => {
  const groupService = inject(GroupService);
  const router = inject(Router);
  const groupId = route.paramMap.get('id');

  if (!groupId) return router.createUrlTree(['/dashboard']);

  const isOwner = await groupService.checkIsOwner(groupId);
  if (isOwner) return true;

  return router.createUrlTree(['/groups', groupId, 'view']);
};
