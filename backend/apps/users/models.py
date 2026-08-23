from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    משתמש בסיסי במערכת.
    משתמשים ב-AbstractUser המובנה של Django, שכבר כולל:
    username, password (מוצפן אוטומטית עם PBKDF2), is_active, date_joined וכו'.

    אין כאן שדה 'role' — התפקיד (Owner / Member) נגזר תמיד בהקשר של קבוצה ספציפית,
    ולא נשמר כתכונה קבועה של המשתמש עצמו.
    """
    email = models.EmailField(unique=True)

    REQUIRED_FIELDS = ['email']  # username + password כבר נדרשים כברירת מחדל

    def __str__(self):
        return self.username
