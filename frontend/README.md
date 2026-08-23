# Frontend — קבוצות לימוד (Angular 21, Standalone, Zoneless)

מימוש מלא של ה-Frontend לפי `study-groups-app-plan.md`: ללא `NgModule`, Zoneless, `@if`/`@for`,
Signals, `httpResource` לרשימות ה-Dashboard, Guards ו-Interceptor פונקציונליים.

## ⚠️ הערה חשובה על ה-Backend

בקבצים שהעלית חסרים חלקי המימוש של ה-Backend עצמו — `manage.py`, `requirements.txt` ו-`README.md`
קיימים, אבל **`config/settings.py`, `apps/users`, `apps/groups`, `apps/videos` לא הועלו בפועל**
(הם מתועדים בתוכנית אך לא קיימים כקבצים אצלי). ה-Frontend כאן נבנה מול חוזה ה-API **כפי שהוא מתועד
בתוכנית** (טבלת ה-endpoints בסעיף 6, מבני הבקשות/תגובות). ברגע שה-Backend באמת עולה על
`http://localhost:8000` לפי אותו חוזה — הכול אמור להסתנכרן בלי שינוי בצד ה-Frontend.
אם תרצה, אני יכול לבנות גם את ה-Backend בפועל לפי התוכנית.

## התקנה והרצה

```bash
cd frontend
npm install
npm start          # ng serve — יעלה על http://localhost:4200
```

בזמן `ng serve`, `proxy.conf.json` מפנה כל בקשה שמתחילה ב-`/api` אל `http://localhost:8000`
(השרת של Django) — כך ש-`environment.apiUrl = '/api'` עובד גם בפיתוח וגם בפרודקשן בלי שינוי.

ודא שה-Backend רץ על פורט 8000 (`python manage.py runserver`) לפני שאתה פותח את `localhost:4200`.

## הרצת הבדיקות (Vitest)

```bash
npm test            # ng test — מריץ את כל קבצי ה-*.spec.ts דרך Vitest
```

הבדיקות מכסות:
- **`AuthService`** — התחברות/הרשמה/logout, שמירת טוקנים ב-sessionStorage, מעבר `isLoggedIn()`.
- **`GroupService` / `VideoService`** — כל בקשת HTTP נבדקת מול ה-endpoint וה-method הנכונים.
- **`authGuard` / `guestGuard` / `groupOwnerGuard`** — הפניות נכונות לפי מצב ההתחברות/בעלות.
- **`authInterceptor`** — צירוף `Authorization: Bearer`, אי-צירוף לבקשות ציבוריות (login/register/refresh),
  ותרחיש רענון טוקן אוטומטי על `401` וחזרה על הבקשה המקורית.
- **קומפוננטות**: `LoginComponent` (ניווט/הודעות שגיאה), `DashboardComponent` (רינדור רשימות ו-empty state),
  `VideoFormComponent` (ולידציה ו-emit של save/cancel), `VideoPlayerComponent` (embed מול קישור רגיל).

## מבנה

תואם 1:1 למבנה שבתוכנית (סעיף 2.2): `core/{models,services,guards,interceptors}`,
`auth/{login,register}`, `dashboard`, `groups/{create-group,join-group,group-manage,group-view}`,
`videos/{video-form,video-player}`. כל קומפוננטה `standalone` (ברירת המחדל ב-Angular 21), טעינה עצלנית
(`loadComponent`) בכל route חוץ מ-root.

## עיצוב

זהות חזותית "מחברת משותפת": רקע נייר חם עם קווי מחברת עדינים, כותרות ב-Fraunces (serif),
טקסט בגוף ב-Heebo (תמיכה מלאה בעברית/RTL — `dir="rtl"` מוגדר ב-`index.html`). האלמנט המזוהה של
המערכת הוא ה"לשונית" הצבעונית בכרטיס קבוצה: **כחול = מלמד/ת כאן, כתום = לומד/ת כאן** — משקף ישירות
את עקרון היסוד של המערכת (התפקיד הוא תכונה של קבוצה ספציפית, לא של המשתמש).

## נקודות ליישום עתידי (מהתוכנית, סעיף 11)

- `httpResource` הוא API יחסית חדש ב-Angular — אם הגרסה המדויקת שתתקין משנה חתימה (למשל שם הפרמטר
  `defaultValue`), התאם בהתאם להודעת השגיאה של ה-TypeScript compiler.
- שדרוג עתידי מוצע בתוכנית: refresh token ב-`HttpOnly` cookie במקום `sessionStorage`, כדי לצמצם חשיפה ל-XSS.
- `group-owner.guard.ts` ו-`checkIsOwner()` הם נוחות ניווט בלבד — ה-Backend הוא שאוכף בפועל (403 גם אם
  ה-Frontend "מרשה" בטעות).
