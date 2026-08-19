import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { checkBackend, readPortFromMobileEnvironment, warnBackendUnreachable } from './check-backend.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const androidDir = join(root, 'android');
const isWin = process.platform === 'win32';

function resolveAdb() {
  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (sdkRoot) {
    const candidate = join(sdkRoot, 'platform-tools', isWin ? 'adb.exe' : 'adb');
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return 'adb';
}

const adb = resolveAdb();

function run(command, args, options = {}) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true, ...options });
  if (result.status !== 0) {
    console.error(`\n[erro] Comando falhou: ${command} ${args.join(' ')}`);
    console.error('Veja a secao "Solucao de problemas" no README.\n');
    process.exit(result.status ?? 1);
  }
}

function checkAdbDevices() {
  const result = spawnSync(adb, ['devices'], { encoding: 'utf8', shell: true });
  if (result.error || result.status !== 0) {
    console.error(`[erro] Nao encontrei o adb (tentei "${adb}").`);
    console.error('Confirme que o Android SDK (platform-tools) esta instalado e que');
    console.error('ANDROID_HOME (ou ANDROID_SDK_ROOT) aponta para ele, ou que "adb" esta no PATH.\n');
    process.exit(1);
  }

  const lines = result.stdout
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean);
  const connected = lines.filter((line) => /\bdevice$/.test(line));

  if (connected.length === 0) {
    console.error('[erro] Nenhum emulador ou dispositivo Android conectado.');
    console.error('Abra um emulador (ex: `emulator -avd <nome-do-avd>`) ou conecte um celular');
    console.error('via USB com depuracao habilitada, e rode o comando novamente.\n');
    process.exit(1);
  }

  console.log(`Dispositivo(s) conectado(s): ${connected.length}`);
}

const port = readPortFromMobileEnvironment();
console.log(`Verificando backend em http://localhost:${port}...`);

if (await checkBackend(port)) {
  console.log('Backend respondendo.');
} else {
  warnBackendUnreachable(port);
  console.warn('Prosseguindo mesmo assim - o app so vai funcionar de verdade com o backend no ar.\n');
}

checkAdbDevices();

console.log('\nBuildando o app para mobile e sincronizando com o projeto Android...');
run('npm', ['run', 'build:mobile']);

console.log('\nGerando o APK de debug (pode demorar na primeira vez)...');
const gradlew = join(androidDir, isWin ? 'gradlew.bat' : 'gradlew');
run(gradlew, ['assembleDebug'], { cwd: androidDir });

console.log(`\nEncaminhando a porta ${port} do backend para o dispositivo (adb reverse)...`);
run(adb, ['reverse', `tcp:${port}`, `tcp:${port}`]);

const apkPath = join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!existsSync(apkPath)) {
  console.error(`[erro] APK nao encontrado em ${apkPath}`);
  process.exit(1);
}

console.log('\nInstalando o APK...');
run(adb, ['install', '-r', `"${apkPath}"`]);

console.log('\nAbrindo o app...');
run(adb, ['shell', 'monkey', '-p', 'com.fisiotech.app', '-c', 'android.intent.category.LAUNCHER', '1']);

console.log('\nPronto! O app deve estar aberto no dispositivo/emulador.');
