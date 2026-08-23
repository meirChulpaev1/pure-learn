from rest_framework.permissions import BasePermission


def _resolve_group(obj):
    """
    obj יכול להיות Group עצמו, או כל אובייקט אחר שיש לו FK בשם 'group' (כמו Video).
    """
    return obj if hasattr(obj, 'owner_id') else obj.group


class IsGroupOwner(BasePermission):
    """
    True אך ורק אם request.user הוא ה-Owner של הקבוצה.
    משמש לכל פעולת ניהול: יצירת/עריכת/מחיקת וידאו, עריכת קבוצה, שינוי סיסמה, ניהול חברים.
    """
    message = 'רק בעל הקבוצה (Owner) רשאי לבצע פעולה זו.'

    def has_object_permission(self, request, view, obj):
        group = _resolve_group(obj)
        return group.owner_id == request.user.id


class IsGroupOwnerOrMember(BasePermission):
    """
    True אם המשתמש הוא Owner *או* חבר רשום (GroupMember) בקבוצה.
    משמש לכל פעולת קריאה (GET) של תוכן קבוצה: פרטי קבוצה, רשימת סרטונים, פרטי סרטון.
    """
    message = 'אין לך גישה לקבוצה זו.'

    def has_object_permission(self, request, view, obj):
        group = _resolve_group(obj)
        if group.owner_id == request.user.id:
            return True
        return group.members.filter(user_id=request.user.id).exists()
