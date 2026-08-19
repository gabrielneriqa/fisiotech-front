import { spawnSync } from 'node:child_process';

import { checkBackend, readPortFromProxyConfig, warnBackendUnreachable } from './check-backend.mjs';

const port = readPortFromProxyConfig();
console.log(`Verificando backend em http://localhost:${port}...`);

if (!(await checkBackend(port))) {
  warnBackendUnreachable(port);
  console.warn('Subindo o dev server mesmo assim - as chamadas de API vao falhar ate o backend estar no ar.\n');
} else {
  console.log('Backend respondendo. Subindo o dev server...\n');
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(npxCmd, ['ng', 'serve'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
