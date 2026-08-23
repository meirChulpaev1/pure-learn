import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { groupOwnerGuard } from './core/guards/group-owner.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
    title: 'התחברות · קבוצות לימוד',
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'הרשמה · קבוצות לימוד',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'הקבוצות שלי',
  },
  {
    path: 'groups/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./groups/create-group/create-group.component').then((m) => m.CreateGroupComponent),
    title: 'קבוצה חדשה',
  },
  {
    path: 'groups/join',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./groups/join-group/join-group.component').then((m) => m.JoinGroupComponent),
    title: 'הצטרפות לקבוצה',
  },
  {
    path: 'groups/:id/manage',
    canActivate: [authGuard, groupOwnerGuard],
    loadComponent: () =>
      import('./groups/group-manage/group-manage.component').then((m) => m.GroupManageComponent),
    title: 'ניהול קבוצה',
  },
  {
    path: 'groups/:id/view',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./groups/group-view/group-view.component').then((m) => m.GroupViewComponent),
    title: 'צפייה בקבוצה',
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
