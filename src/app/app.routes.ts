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
            data: { hideHeader: true },
          },
          {
            path: 'pacientes',
            loadComponent: () =>
              import('./features/pacientes/paciente-list/paciente-list').then((m) => m.PacienteList),
            data: { title: 'Pacientes', backTo: '/home', hideHeader: true },
          },
          {
            path: 'pacientes/novo',
            loadComponent: () =>
              import('./features/pacientes/paciente-form/paciente-form').then((m) => m.PacienteForm),
            data: { title: 'Novo Paciente' },
          },
          {
            path: 'pacientes/:id/mensagens',
            loadComponent: () =>
              import('./features/mensagens/mensagem-thread/mensagem-thread').then((m) => m.MensagemThread),
            data: { title: 'Mensagens', hideHeader: true, hideNav: true },
          },
          {
            path: 'mensagens',
            loadComponent: () =>
              import('./features/mensagens/caixa-entrada/caixa-entrada').then((m) => m.CaixaEntrada),
            data: { title: 'Mensagens', backTo: '/home' },
          },
          {
            path: 'pacientes/:id',
            loadComponent: () =>
              import('./features/pacientes/paciente-form/paciente-form').then((m) => m.PacienteForm),
            data: { title: 'Editar Paciente' },
          },
          {
            path: 'consultas',
            loadComponent: () =>
              import('./features/consultas/consulta-list/consulta-list').then((m) => m.ConsultaList),
            data: { title: 'Consultas', backTo: '/home', hideHeader: true },
          },
          {
            path: 'consultas/novo',
            loadComponent: () =>
              import('./features/consultas/consulta-form/consulta-form').then((m) => m.ConsultaForm),
            data: { title: 'Nova Consulta' },
          },
          {
            path: 'consultas/:id/wizard',
            loadComponent: () =>
              import('./features/consultas/consulta-wizard/consulta-wizard').then((m) => m.ConsultaWizard),
            data: { title: 'Registro Clínico', hideHeader: true, hideNav: true },
          },
          {
            path: 'consultas/:id',
            loadComponent: () =>
              import('./features/consultas/consulta-detail/consulta-detail').then((m) => m.ConsultaDetail),
            data: { title: 'Consulta', hideHeader: true, hideNav: true },
          },
          {
            path: 'senha',
            loadComponent: () =>
              import('./features/profissional-senha/profissional-senha').then((m) => m.ProfissionalSenha),
            data: { title: 'Alterar Senha', backTo: '/home' },
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
            data: { title: 'Profissionais', hideHeader: true },
          },
          {
            path: 'profissionais/novo',
            loadComponent: () =>
              import('./features/admin/profissional-form/profissional-form').then((m) => m.ProfissionalForm),
            data: { title: 'Novo Profissional' },
          },
          {
            path: 'profissionais/:id',
            loadComponent: () =>
              import('./features/admin/profissional-form/profissional-form').then((m) => m.ProfissionalForm),
            data: { title: 'Editar Profissional' },
          },
          {
            path: 'pacientes',
            loadComponent: () => import('./features/admin/paciente-list/paciente-list').then((m) => m.PacienteList),
            data: { title: 'Pacientes' },
          },
          {
            path: 'pacientes/:id',
            loadComponent: () => import('./features/admin/paciente-form/paciente-form').then((m) => m.PacienteForm),
            data: { title: 'Editar Paciente' },
          },
          {
            path: 'senha',
            loadComponent: () => import('./features/admin/admin-senha/admin-senha').then((m) => m.AdminSenha),
            data: { title: 'Alterar Senha', backTo: '/admin/profissionais' },
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
            data: { hideHeader: true },
          },
          {
            path: 'consultas',
            loadComponent: () =>
              import('./features/paciente/paciente-consulta-list/paciente-consulta-list').then(
                (m) => m.PacienteConsultaList,
              ),
            data: { title: 'Minhas Consultas' },
          },
          {
            path: 'consultas/marcar',
            loadComponent: () =>
              import('./features/paciente/consulta-booking/consulta-booking').then((m) => m.ConsultaBooking),
            data: { title: 'Marcar Consulta', backTo: '/paciente/consultas', hideHeader: true, hideNav: true },
          },
          {
            path: 'consultas/:id',
            loadComponent: () =>
              import('./features/paciente/paciente-consulta-detail/paciente-consulta-detail').then(
                (m) => m.PacienteConsultaDetail,
              ),
            data: { title: 'Consulta' },
          },
          {
            path: 'mensagens',
            loadComponent: () =>
              import('./features/paciente/paciente-mensagens/paciente-mensagens').then((m) => m.PacienteMensagens),
            data: { title: 'Mensagens' },
          },
          {
            path: 'mensagens/:profissionalId',
            loadComponent: () =>
              import('./features/paciente/paciente-mensagem-thread/paciente-mensagem-thread').then(
                (m) => m.PacienteMensagemThread,
              ),
            data: { title: 'Mensagens' },
          },
          {
            path: 'perfil',
            loadComponent: () =>
              import('./features/paciente/paciente-perfil/paciente-perfil').then((m) => m.PacientePerfil),
            data: { title: 'Meu Perfil' },
          },
          {
            path: 'senha',
            loadComponent: () =>
              import('./features/paciente/paciente-senha/paciente-senha').then((m) => m.PacienteSenha),
            data: { title: 'Alterar Senha', backTo: '/paciente/perfil' },
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
