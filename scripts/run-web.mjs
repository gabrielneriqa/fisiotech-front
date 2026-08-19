import { spawn } from 'node:child_process';

import { checkBackend, readPortFromProxyConfig, warnBackendUnreachable } from './check-backend.mjs';

const port = readPortFromProxyConfig();
console.log(`Verificando backend em http://localhost:${port}...`);

if (!(await checkBackend(port))) {
  warnBackendUnreachable(port);
  console.warn('Subindo o dev server mesmo assim - as chamadas de API vao falhar ate o backend estar no ar.\n');
} else {
  console.log('Backend respondendo. Subindo o dev server...\n');
}

// spawn (assincrono) em vez de spawnSync: no Windows, chamar spawnSync logo
// apos um fetch/AbortSignal.timeout ainda pendente pode derrubar o processo
// com um assertion failure do libuv (UV_HANDLE_CLOSING).
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(npxCmd, ['ng', 'serve'], { stdio: 'inherit', shell: true });
child.on('error', (err) => {
  console.error(`\n[erro] Nao consegui iniciar o "${npxCmd} ng serve": ${err.message}\n`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 0));
