import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'lessons',
        loadComponent: () =>
          import('../lessons/lessons.page').then((m) => m.LessonsPage),
      },
      {
        path: 'exam',
        loadComponent: () =>
          import('../exam/exam.page').then((m) => m.ExamPage),
      },
      {
        path: 'exercise',
        loadComponent: () =>
          import('../exercise/exercise.page').then((m) => m.ExercisePage),
      },
      {
        path: 'a',
        loadComponent: () =>
          import('../lessons/Vocales/A/a.page').then((m) => m.aPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
