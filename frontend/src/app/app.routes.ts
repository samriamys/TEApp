import { Routes } from '@angular/router';
import { AuthGuardService } from '~/app/services/auth/auth-guard.service';

export const routes: Routes = [
  {
    path: 'lessons',
    loadComponent: () =>
      import('~/app/learning/activity-map.page').then((m) => m.ActivityMapPage),
    canActivate: [AuthGuardService],
  },
  {
    path: 'exam',
    loadComponent: () => import('~/app/learning/activity-map.page').then((m) => m.ActivityMapPage),
    data: { kind: 'exam' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'exam/:letra',
    loadComponent: () => import('~/app/exam/exam.page').then((m) => m.ExamPage),
    canActivate: [AuthGuardService],
  },
  {
    path: 'exercise',
    loadComponent: () => import('~/app/learning/activity-map.page').then((m) => m.ActivityMapPage),
    data: { kind: 'exercise' },
    canActivate: [AuthGuardService],
  },
  {
    path: 'exercise/:letra',
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
    path: 'onboarding',
    loadComponent: () =>
      import('~/app/pages/onboarding/onboarding.page').then((m) => m.OnboardingPage),
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
    path: 'local-access',
    loadComponent: () =>
      import('~/app/pages/local-access/local-access.page').then((m) => m.LocalAccessPage),
  },
  {
    path: 'lessons/Vocales/:mayuscula/:letra',
    canActivate: [AuthGuardService],
    loadComponent: () =>
      import('~/app/lessons/generic-lesson/generic-lesson.component').then(
        (m) => m.GenericLessonsComponent,
      ),
  },
  {
    path: 'lessons/letras/:letra',
    canActivate: [AuthGuardService],
    loadComponent: () =>
      import('~/app/lessons/generic-lesson/generic-lesson.component').then(
        (m) => m.GenericLessonsComponent,
      ),
  },
  {
    path: 'lessons-complete',
    loadComponent: () =>
      import('~/app/lessons/lessons-complete/lessons-complete.component').then(
        (m) => m.LessonsCompleteComponent,
      ),
  },
  {
    path: 'exercise-complete',
    loadComponent: () =>
      import('~/app/exercise/exercise-complete/exercise-complete.component').then(
        (m) => m.ExerciseCompleteComponent,
      ),
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
