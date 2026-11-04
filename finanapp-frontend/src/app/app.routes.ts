import { Routes } from '@angular/router';
import {authGuard} from './core/guards/auth.guard';

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
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'transacciones',
        loadComponent: () =>
          import('./features/transacciones/transacciones').then((m) => m.Transacciones)
      },
      {
        path: 'obligaciones',
        loadComponent: () =>
          import('./features/obligaciones/obligaciones').then((m) => m.Obligaciones)
      },
      {
        path: 'ahorros',
        loadComponent: () =>
          import('./features/metas-ahorro/metas-ahorro').then((m) => m.MetasAhorroComponent)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categorias').then((m) => m.Categorias)
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./features/notificaciones/notificaciones').then((m) => m.NotificacionesComponent)
      }
    ]
  }
];
