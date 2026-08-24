# Frontend — Study Groups App (Angular 21, standalone, zoneless)

## דרישות

- Node.js 20.19+ / 22.12+ (נדרש ל-Angular 21)
- ה-Backend (Django) צריך לרוץ על `http://localhost:8000` — ראו `backend/README.md`

## הרצה מקומית

```bash
cd frontend
npm install
npm start
```

האפליקציה תעלה על `http://localhost:4200/`. ודאו שה-Backend רץ במקביל על פורט 8000
(ה-`environment.development.ts` מצביע ל-`http://localhost:8000/api`).

## הרצת הבדיקות (Vitest)

```bash
npm test
```

הבדיקות מכסות:
- **`error.util.spec.ts`** — פענוח כל צורות השגיאה של DRF (`detail`, שגיאת שדה, ברירת מחדל).
- **`youtube.util.spec.ts`** — המרת קישורי YouTube (watch/youtu.be/shorts/embed) לכתובת הטמעה.
- **`auth.service.spec.ts`** — login שומר טוקנים וטוען את המשתמש, register, logout, refresh.
- **`group.service.spec.ts`** / **`video.service.spec.ts`** — כל בקשות ה-HTTP (method, URL, body נכונים).
- **`auth.guard.spec.ts`** — חוסם משתמש לא מחובר ומפנה ל-`/login?returnUrl=...`.
- **`group-owner.guard.spec.ts`** — מאפשר Owner, מפנה חבר רגיל לתצוגת צפייה, ומטפל בשגיאות 403/404.
- **`auth.interceptor.spec.ts`** — מצרף Bearer token, מרענן טוקן פג-תוקף (401) ושולח מחדש את הבקשה,
  ומתנתק אם גם הרענון נכשל.
- **`login.component.spec.ts`** — ולידציית טופס, קריאה ל-service, ניווט, הודעות שגיאה.
- **`video-list.component.spec.ts`** — הצגת/הסתרת כפתורי ניהול, אירועי edit/delete, מצב "מורחב".

## מבנה הפרויקט

ראו את מסמך התכנון (`study-groups-app-plan.md`) לפירוט המלא. בקצרה:

```
src/app/
  core/
    models/        # תואמים 1:1 ל-serializers של ה-Backend
    services/       # AuthService, GroupService, VideoService
    guards/         # authGuard, groupOwnerGuard (פונקציונליים)
    interceptors/    # authInterceptor (Bearer + auto-refresh)
    utils/
  auth/             # Login, Register
  dashboard/        # My Teaching / My Student Groups
  groups/           # create-group, join-group, group-manage (Owner), group-view (Member)
  videos/           # video-list, video-form, video-player (embed YouTube אוטומטי)
  shared/components/navbar/
```

**כל קומפוננטה ב-standalone. אין קובץ NgModule יחיד בפרויקט.**
Zoneless change detection הוא ברירת המחדל (`polyfills: []` ב-`angular.json`).

## סנכרון עם ה-Backend

כל המודלים (`core/models/*.ts`) תואמים אחד-לאחד לשדות שמוחזרים מה-Django serializers, וכל
קריאות ה-API ב-`GroupService`/`VideoService`/`AuthService` תואמות בדיוק לטבלת ה-endpoints
במסמך התכנון. אם תשנו שדה ב-serializer בצד ה-Backend, עדכנו את המודל התואם כאן.

## הערה חשובה

בסביבת הפיתוח שבה נכתב הקוד לא הייתה גישה לאינטרנט, ולכן לא ניתן היה להריץ בפועל
`npm install` / `ng serve` / `ng test` ולוודא הרצה מלאה מקצה לקצה. כל הקבצים עברו בדיקת
תחביר TypeScript (`tsc --noEmit`) ונמצאו תקינים, אך מומלץ להריץ את הפקודות למעלה אצלכם
ולוודא שהכל אכן עובד ושכל הבדיקות עוברות (ירוק). אם תיתקלו בשגיאה, שלחו אותה ונתקן.
