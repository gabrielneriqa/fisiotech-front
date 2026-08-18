import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { Icon, IconName } from '../../core/ui/icon/icon';

interface NavItem {
  path: string;
  icon: IconName;
  label: string;
}

const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  ROLE_ADMIN: [{ path: '/admin/profissionais', icon: 'briefcase', label: 'Profissionais' }],
  ROLE_PROFISSIONAL: [
    { path: '/home', icon: 'home', label: 'Home' },
    { path: '/pacientes', icon: 'users', label: 'Pacientes' },
    { path: '/consultas', icon: 'calendar', label: 'Consultas' },
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
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

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
