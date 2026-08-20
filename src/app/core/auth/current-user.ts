export interface CurrentUser {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}
