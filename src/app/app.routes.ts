import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('./features/pacientes/paciente-list/paciente-list').then((m) => m.PacienteList),
      },
      {
        path: 'pacientes/novo',
        loadComponent: () =>
          import('./features/pacientes/paciente-form/paciente-form').then((m) => m.PacienteForm),
      },
      {
        path: 'pacientes/:id',
        loadComponent: () =>
          import('./features/pacientes/paciente-form/paciente-form').then((m) => m.PacienteForm),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
