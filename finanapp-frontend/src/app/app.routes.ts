import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login)
  },
  {
    path: 'auth/registro',
    loadComponent: () =>
      import('./features/auth/registro/registro').then((m) => m.Registro)
  }
];
