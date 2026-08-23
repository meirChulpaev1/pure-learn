# Backend — Study Groups API (Django + DRF)

## הרצה מקומית

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # ואז לערוך SECRET_KEY לערך אקראי משלך

python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser   # אופציונלי — לגישה ל-/admin/

python manage.py runserver
```

השרת יעלה על `http://localhost:8000/`.

## הרצת הבדיקות (Tests)

```bash
python manage.py test tests
```

הבדיקות מוכיחות בפועל (לא רק בתיאוריה) שההרשאות נאכפות בשרת:
- תלמיד שמנסה להוסיף/לערוך/למחוק סרטון → מקבל `403`.
- משתמש שאינו Owner ואינו Member של קבוצה → לא רואה בכלל את תוכנה.
- ניסיון הצטרפות כפולה לאותה קבוצה → נחסם.
- סיסמאות (משתמש וקבוצה) נשמרות תמיד כ-hash, לא כטקסט גלוי.

## מבנה ה-API

ראו את מסמך התכנון (`study-groups-app-plan.md`) לטבלת ה-endpoints המלאה. בקצרה:

- `/api/auth/register/`, `/api/auth/login/`, `/api/auth/refresh/`, `/api/auth/logout/`, `/api/auth/me/`
- `/api/groups/my-teaching/`, `/api/groups/my-student/`, `/api/groups/`, `/api/groups/{id}/`,
  `/api/groups/{id}/change-password/`, `/api/groups/join/`, `/api/groups/{id}/members/`, `/api/groups/{id}/members/{user_id}/`
- `/api/groups/{group_id}/videos/`, `/api/groups/{group_id}/videos/{id}/`

כל בקשה (מלבד register/login/refresh) דורשת header:
```
Authorization: Bearer <access_token>
```

## הערות

- מסד הנתונים כברירת מחדל הוא SQLite (`db.sqlite3`) לצורך פיתוח מקומי בלבד. בפרודקשן יש להחליף ל-PostgreSQL ב-`config/settings.py` (`DATABASES`).
- ה-CORS מוגדר כברירת מחדל ל-`http://localhost:4200` (Angular dev server). לשנות ב-`.env` אם צריך.
