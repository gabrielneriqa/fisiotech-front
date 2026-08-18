export function homeRouteFor(role: string): string {
  switch (role) {
    case 'ROLE_ADMIN':
      return '/admin/profissionais';
    case 'ROLE_PACIENTE':
      return '/paciente/home';
    default:
      return '/home';
  }
}
