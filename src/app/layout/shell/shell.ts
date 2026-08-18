import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  ROLE_ADMIN: [{ path: '/admin/profissionais', icon: '🩺', label: 'Profissionais' }],
  ROLE_PROFISSIONAL: [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/pacientes', icon: '👥', label: 'Pacientes' },
    { path: '/consultas', icon: '📅', label: 'Consultas' },
  ],
  ROLE_PACIENTE: [
    { path: '/paciente/home', icon: '🏠', label: 'Home' },
    { path: '/paciente/consultas', icon: '📅', label: 'Consultas' },
    { path: '/paciente/mensagens', icon: '💬', label: 'Mensagens' },
    { path: '/paciente/perfil', icon: '👤', label: 'Perfil' },
  ],
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
