import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
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

      // Rotas do Profissional
      {
        path: '',
        canActivateChild: [roleGuard('ROLE_PROFISSIONAL')],
        children: [
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
            path: 'mensagens',
            loadComponent: () =>
              import('./features/mensagens/caixa-entrada/caixa-entrada').then((m) => m.CaixaEntrada),
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

      // Rotas do Admin
      {
        path: 'admin',
        canActivateChild: [roleGuard('ROLE_ADMIN')],
        children: [
          {
            path: 'profissionais',
            loadComponent: () =>
              import('./features/admin/profissional-list/profissional-list').then((m) => m.ProfissionalList),
          },
          {
            path: 'profissionais/novo',
            loadComponent: () =>
              import('./features/admin/profissional-form/profissional-form').then((m) => m.ProfissionalForm),
          },
          {
            path: 'profissionais/:id',
            loadComponent: () =>
              import('./features/admin/profissional-form/profissional-form').then((m) => m.ProfissionalForm),
          },
        ],
      },

      // Rotas do Paciente
      {
        path: 'paciente',
        canActivateChild: [roleGuard('ROLE_PACIENTE')],
        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./features/paciente/paciente-home/paciente-home').then((m) => m.PacienteHome),
          },
          {
            path: 'consultas',
            loadComponent: () =>
              import('./features/paciente/paciente-consulta-list/paciente-consulta-list').then(
                (m) => m.PacienteConsultaList,
              ),
          },
          {
            path: 'consultas/:id',
            loadComponent: () =>
              import('./features/paciente/paciente-consulta-detail/paciente-consulta-detail').then(
                (m) => m.PacienteConsultaDetail,
              ),
          },
          {
            path: 'mensagens',
            loadComponent: () =>
              import('./features/paciente/paciente-mensagens/paciente-mensagens').then((m) => m.PacienteMensagens),
          },
          {
            path: 'perfil',
            loadComponent: () =>
              import('./features/paciente/paciente-perfil/paciente-perfil').then((m) => m.PacientePerfil),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
