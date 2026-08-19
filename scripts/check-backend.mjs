import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

export function readPortFromProxyConfig() {
  const content = readFileSync(join(root, 'proxy.conf.js'), 'utf8');
  const match = content.match(/target:\s*['"]http:\/\/localhost:(\d+)['"]/);
  return match ? match[1] : '8080';
}

export function readPortFromMobileEnvironment() {
  const content = readFileSync(join(root, 'src/environments/environment.mobile.ts'), 'utf8');
  const match = content.match(/apiUrl:\s*['"]http:\/\/localhost:(\d+)['"]/);
  return match ? match[1] : '8081';
}

export async function checkBackend(port) {
  try {
    const response = await fetch(`http://localhost:${port}/v3/api-docs`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function warnBackendUnreachable(port) {
  console.warn(`\n[aviso] Nao consegui alcancar o backend em http://localhost:${port}.`);
  console.warn('  Suba o backend primeiro (veja o README do FisioTech-back) ou, se ele');
  console.warn(`  estiver rodando em outra porta, ajuste os arquivos que referenciam ${port}.\n`);
}
