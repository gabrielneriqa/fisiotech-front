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
        path: 'pacientes/:id/mensagens',
        loadComponent: () =>
          import('./features/mensagens/mensagem-thread/mensagem-thread').then((m) => m.MensagemThread),
      },
      {
        path: 'pacientes/:id',
        loadComponent: () =>
          import('./features/pacientes/paciente-form/paciente-form').then((m) => m.PacienteForm),
      },
      {
        path: 'consultas',
        loadComponent: () =>
          import('./features/consultas/consulta-list/consulta-list').then((m) => m.ConsultaList),
      },
      {
        path: 'consultas/novo',
        loadComponent: () =>
          import('./features/consultas/consulta-form/consulta-form').then((m) => m.ConsultaForm),
      },
      {
        path: 'consultas/:id/wizard',
        loadComponent: () =>
          import('./features/consultas/consulta-wizard/consulta-wizard').then((m) => m.ConsultaWizard),
      },
      {
        path: 'consultas/:id',
        loadComponent: () =>
          import('./features/consultas/consulta-detail/consulta-detail').then((m) => m.ConsultaDetail),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
