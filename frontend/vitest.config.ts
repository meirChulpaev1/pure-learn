/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// Angular 21 מגיע כברירת מחדל עם Vitest כ-test runner (ng test מפעיל את זה דרך @angular/build).
// קובץ זה מוגדר גם עבור הרצה ישירה עם `npx vitest` בזמן פיתוח.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
