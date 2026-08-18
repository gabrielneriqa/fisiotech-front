// /pacientes é tanto uma rota do Angular quanto um prefixo de endpoint do backend.
// bypass evita que uma navegação de página inteira (refresh, link direto) seja
// enviada pro backend em vez de servir a SPA - só chamadas de API (fetch/XHR do
// HttpClient, que não pedem text/html) são de fato proxeadas.
function bypassPageNavigation(req) {
  const accept = req.headers['accept'] || '';
  if (accept.includes('text/html')) {
    return '/index.html';
  }
}

const PROXY_CONFIG = {
  '/pacientes': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    bypass: bypassPageNavigation,
  },
  '/profissionais': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    bypass: bypassPageNavigation,
  },
  '/auth': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    bypass: bypassPageNavigation,
  },
  '/consultas': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    bypass: bypassPageNavigation,
  },
  '/mensagens': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    bypass: bypassPageNavigation,
  },
  '/avaliacoes': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    bypass: bypassPageNavigation,
  },
};

module.exports = PROXY_CONFIG;
