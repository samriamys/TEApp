import { Routes } from '@angular/router';
import { AuthGuardService } from '~/app/services/auth/auth-guard.service';
import { TabsPage } from '~/app/tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('~/app/tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('~/app/tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('~/app/tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: '/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('~/app/pages/home/home.page').then((m) => m.HomePage),
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
    path: '**',
    redirectTo: '',
  },
];
