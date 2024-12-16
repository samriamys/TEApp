import { Routes } from '@angular/router';
import { AuthGuardService } from '~/app/services/auth/auth-guard.service';

export const routes: Routes = [
  {
    path: 'lessons',
    loadComponent: () =>
      import('~/app/lessons/lessons.page').then((m) => m.LessonsPage),
    canActivate: [AuthGuardService],
  },
  {
    path: 'exam',
    loadComponent: () => import('~/app/exam/exam.page').then((m) => m.ExamPage),
    canActivate: [AuthGuardService],
  },
  {
    path: 'exercise',
    loadComponent: () =>
      import('~/app/exercise/exercise.page').then((m) => m.ExercisePage),
    canActivate: [AuthGuardService],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('~/app/pages/profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [AuthGuardService],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('~/app/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('~/app/pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'a',
    loadComponent: () =>
      import('~/app/lessons/Vocales/A/a/a.page').then((m) => m.aPage),
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('~/app/pages/logout/logout.page').then((m) => m.LogoutPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('~/app/pages/profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [AuthGuardService],
  },
];
