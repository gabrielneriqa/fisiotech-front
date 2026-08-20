import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ConfirmDialog } from '../../core/ui/confirm-dialog/confirm-dialog';
import { Icon, IconName } from '../../core/ui/icon/icon';

interface NavItem {
  path: string;
  icon: IconName;
  label: string;
}

const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  ROLE_ADMIN: [
    { path: '/admin/profissionais', icon: 'briefcase', label: 'Profissionais' },
    { path: '/admin/pacientes', icon: 'users', label: 'Pacientes' },
  ],
  ROLE_PROFISSIONAL: [
    { path: '/home', icon: 'home', label: 'Home' },
    { path: '/pacientes', icon: 'users', label: 'Pacientes' },
    { path: '/consultas', icon: 'calendar', label: 'Consultas' },
    { path: '/mensagens', icon: 'chat', label: 'Mensagens' },
  ],
  ROLE_PACIENTE: [
    { path: '/paciente/home', icon: 'home', label: 'Home' },
    { path: '/paciente/consultas', icon: 'calendar', label: 'Consultas' },
    { path: '/paciente/mensagens', icon: 'chat', label: 'Mensagens' },
    { path: '/paciente/perfil', icon: 'user', label: 'Perfil' },
  ],
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, ConfirmDialog],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;

  protected readonly navItems = computed<NavItem[]>(
    () => NAV_ITEMS_BY_ROLE[this.currentUser()?.role ?? ''] ?? [],
  );

  protected readonly isPaciente = computed(() => this.currentUser()?.role === 'ROLE_PACIENTE');

  private readonly routeData = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.deepestRouteData()),
    ),
    { initialValue: {} as Record<string, unknown> },
  );

  protected readonly pageTitle = computed(() => this.routeData()['title'] as string | undefined);
  protected readonly backTo = computed(() => this.routeData()['backTo'] as string | undefined);

  protected readonly sidebarAberta = signal(false);

  protected abrirSidebar(): void {
    this.sidebarAberta.set(true);
  }

  protected fecharSidebar(): void {
    this.sidebarAberta.set(false);
  }

  protected iniciais(nome: string | undefined): string {
    if (!nome) {
      return '';
    }
    return nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  private deepestRouteData(): Record<string, unknown> {
    let current = this.router.routerState.root;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current.snapshot.data;
  }
}
