# FisioTech — Frontend

Aplicação web (SPA Angular) para o sistema de gestão de clínica de fisioterapia FisioTech. Cobre as três áreas do sistema: **Admin** (gestão de profissionais), **Profissional** (pacientes, consultas, mensagens) e **Paciente** (autoatendimento — consultas, mensagens, perfil, avaliação de consultas). A mesma base de código também é empacotada como **app Android** via Capacitor, sem nenhuma tela ou lógica duplicada.

Este documento cobre tudo que é necessário para clonar o projeto em qualquer máquina, rodar o app no navegador e, opcionalmente, gerar e testar o APK Android.

> Este front depende do backend [FisioTech-back](https://github.com/gabrielneriqa/fisiotech-back) rodando localmente. Siga o README daquele repositório primeiro para ter a API no ar com um usuário admin disponível.

## Stack

- **Angular 22** (standalone components, signals, sintaxe de control-flow `@if`/`@for`, sem `NgModule`)
- **Reactive Forms** (`@angular/forms`)
- **Vitest** (test runner padrão do Angular CLI)
- **Capacitor 8** (empacotamento do app web como app Android nativo)

## Pré-requisitos

- **Node.js 20.19+ ou 22.12+** (recomendado usar a versão LTS mais recente — este projeto foi desenvolvido e testado com Node 24)
- **npm** (instalado junto com o Node)
- Backend rodando localmente (veja [FisioTech-back](https://github.com/gabrielneriqa/fisiotech-back)) — só é necessário para gerar o APK Android:
  - **JDK 21**
  - **Android SDK** (via Android Studio, ou apenas as *command line tools* + *platform-tools*)

## Clonando e instalando

```bash
git clone https://github.com/gabrielneriqa/fisiotech-front.git
cd fisiotech-front
npm install
```

## Modo rápido: um comando

Depois do `npm install`, com o backend já rodando (veja o README do [FisioTech-back](https://github.com/gabrielneriqa/fisiotech-back)), dois comandos cobrem os dois modos de uso do projeto:

```bash
npm run web      # sobe o dev server (ng serve) em http://localhost:4200
npm run mobile   # builda, gera o APK, instala e abre no emulador/dispositivo conectado
```

Os dois primeiro checam se o backend está respondendo na porta esperada (avisando, mas sem travar, se não estiver) e o `mobile` para se não houver nenhum emulador/dispositivo Android conectado. As seções abaixo detalham exatamente o que cada um faz e como configurar/depurar cada passo manualmente.

## Conectando ao backend

Em desenvolvimento (`ng serve`), o Angular **não** chama o backend diretamente — ele usa um proxy (`proxy.conf.js`) que encaminha as chamadas de API para o backend, evitando problemas de CORS e mantendo tudo na mesma origem (`localhost:4200`). Por padrão, o proxy aponta para `http://localhost:8080`, que é a porta padrão do Spring Boot.

**Se o seu backend estiver rodando em outra porta** (por exemplo, porque a 8080 já está em uso na sua máquina), edite `proxy.conf.js` e troque todas as ocorrências de `localhost:8080` pela porta correta antes de rodar `npm start`:

```js
// proxy.conf.js
const PROXY_CONFIG = {
  '/pacientes': {
    target: 'http://localhost:8081', // <- ajuste aqui (e nos demais prefixos abaixo)
    ...
  },
  ...
};
```

É necessário reiniciar o `ng serve` depois de editar esse arquivo para a mudança ter efeito.

## Rodando em desenvolvimento

Com o backend já no ar (ver seção acima):

```bash
npm run web
```

(equivalente a `npm start`/`ng serve`, mas com uma checagem prévia de que o backend está acessível na porta configurada em `proxy.conf.js`). Acesse `http://localhost:4200`. A aplicação recarrega automaticamente ao salvar qualquer arquivo fonte.

### Login de teste

Não existe usuário de demonstração pré-cadastrado no front — os usuários vêm do backend. Siga o fluxo de curl do README do [FisioTech-back](https://github.com/gabrielneriqa/fisiotech-back#testando-a-api-do-zero-fluxo-completo-via-curl) para criar um profissional (e opcionalmente um paciente) antes de logar pela tela `/login`. Resumo rápido, com o backend em modo `dev`:

1. Crie um profissional autenticando como admin (`admin@fisiotech.com` / `12345678` no modo `dev` do backend).
2. Faça login na tela inicial do front com o email/senha desse profissional.
3. Para testar a área do paciente, o jeito mais rápido é usar a aba **Cadastrar** da própria tela de login (autocadastro público) — cria a conta e já faz login automaticamente. Alternativamente, um profissional logado pode cadastrar um paciente pela tela **Pacientes** do app.
4. Um paciente autocadastrado ainda não tem nenhum profissional vinculado nem consegue trocar mensagens com ninguém até marcar sua primeira consulta (tela **Marcar Consulta**, que também define automaticamente esse profissional como responsável) — um paciente cadastrado diretamente pelo profissional já nasce vinculado a ele, mas mesmo assim só consegue conversar depois de existir uma consulta marcada entre os dois.

## Rodando os testes

```bash
npm test
```

## Build de produção

```bash
npm run build
```

Os artefatos ficam em `dist/FisioTech-front/browser`. Antes de fazer deploy real, ajuste `src/environments/environment.ts` com a URL absoluta do backend em produção (o campo `apiUrl`, hoje vazio pois em dev/produção local o proxy/mesma origem cuidam disso).

## Estrutura do projeto

```
src/app/
  core/            # serviços HTTP, guards de rota, interceptor de auth, modelos — por domínio (auth, pacientes, mensagens, etc.)
  features/        # telas, organizadas por área: admin/, paciente/, pacientes/, consultas/, mensagens/, login/, home/
  layout/shell/     # casca da aplicação (header, nav inferior por papel do usuário, router-outlet)
  app.routes.ts     # árvore de rotas, agrupada por papel (ROLE_ADMIN / ROLE_PROFISSIONAL / ROLE_PACIENTE) via roleGuard
```

Autenticação: `core/auth/auth.service.ts` guarda a sessão (credenciais HTTP Basic) e um interceptor as anexa a toda chamada HTTP. `authGuard` exige sessão ativa; `roleGuard(role)` restringe sub-árvores de rotas por papel.

---

## Empacotando como app Android (Capacitor)

O mesmo código do app web roda dentro de um `WebView` nativo via [Capacitor](https://capacitorjs.com/), sem nenhuma tela reescrita. Esta seção cobre como gerar e instalar o APK de debug para testar em um emulador ou celular físico.

### Pré-requisitos adicionais

- **JDK 21** (o mesmo usado para o backend serve aqui)
- **Android SDK**, com pelo menos:
  - *Platform-tools* (fornece o `adb`)
  - Uma *platform* Android (ex: `android-35`) e as *build-tools* correspondentes
  - Um emulador (AVD) configurado, **ou** um celular físico com depuração USB habilitada
- Variável de ambiente `ANDROID_HOME` (ou `ANDROID_SDK_ROOT`) apontando para a instalação do SDK. Não é necessário criar `android/local.properties` manualmente — o Gradle usa `ANDROID_HOME` diretamente.

O caminho mais simples para ter tudo isso é instalar o **Android Studio**, que já vem com o SDK, um AVD padrão e o JDK. A geração do APK abaixo, porém, é feita inteiramente por linha de comando — o Android Studio não precisa estar aberto.

### Um comando (recomendado)

Com um emulador já aberto (ou um celular conectado via USB com depuração habilitada) e o backend rodando:

```bash
npm run mobile
```

Isso executa, em sequência, exatamente os passos 1 a 5 abaixo: builda para mobile, sincroniza com o Capacitor, gera o APK de debug, roda `adb reverse` na porta lida de `environment.mobile.ts`, instala o APK e abre o app. Se qualquer passo falhar (SDK não encontrado, nenhum dispositivo conectado, build do Gradle quebrando), o script para e imprime uma mensagem indicando o que verificar — as subseções abaixo explicam cada um desses passos em detalhe, para quando for preciso depurar manualmente.

### 1. Gerar o build web para mobile e sincronizar com o projeto Android

```bash
npm run build:mobile
```

Esse comando builda o Angular usando a configuration `mobile` (que troca `environment.ts` por `src/environments/environment.mobile.ts`) e copia os artefatos para dentro de `android/app/src/main/assets/public` via `npx cap sync android`.

**Antes de rodar**, confira `src/environments/environment.mobile.ts` — ele define a URL absoluta que o app dentro do celular/emulador vai usar para chamar o backend (o proxy do `ng serve` não existe dentro do APK). Por padrão está configurado como:

```ts
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8081',
};
```

Isso funciona porque, tanto no emulador quanto num celular físico via USB, `localhost` dentro do app passa a apontar para o backend na sua máquina **depois** de rodar `adb reverse` (veja o passo 4). Ajuste a porta (`8081` acima) para a porta real em que o backend está rodando na sua máquina.

### 2. Gerar o APK de debug

```bash
cd android
```

**Linux/macOS:**
```bash
./gradlew assembleDebug
```

**Windows (PowerShell):**
```powershell
.\gradlew.bat assembleDebug
```

Se o Gradle não achar o SDK, confirme que `ANDROID_HOME` está definida na sessão do terminal antes de rodar o comando. Se aparecer erro de certificado TLS ao baixar dependências do Gradle (comum em redes corporativas/escolares com inspeção de TLS), defina antes de buildar:

```powershell
$env:JAVA_OPTS = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
$env:GRADLE_OPTS = "-Djavax.net.ssl.trustStoreType=Windows-ROOT"
```

O APK gerado fica em `android/app/build/outputs/apk/debug/app-debug.apk`.

Alternativamente, o script abaixo (na raiz do projeto) encadeia os dois passos acima (`build:mobile` + `assembleDebug`):

```bash
npm run android:apk
```

### 3. Subir um emulador (ou conectar um celular via USB)

Com o Android Studio instalado, você pode criar/abrir um AVD por ele, ou por linha de comando:

```bash
emulator -avd <nome-do-avd>
```

Para um celular físico, basta habilitar **Opções do desenvolvedor → Depuração USB** e conectar por cabo. Confirme que o dispositivo aparece com:

```bash
adb devices
```

### 4. Encaminhar a porta do backend para o dispositivo

Tanto para emulador quanto para celular físico via USB, isso faz `localhost` **dentro** do dispositivo apontar para o backend rodando na sua máquina:

```bash
adb reverse tcp:8081 tcp:8081
```

(troque `8081` pela porta real do backend, igual usado em `environment.mobile.ts`). Rode esse comando novamente sempre que reconectar o dispositivo.

### 5. Instalar e abrir o app

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.fisiotech.app -c android.intent.category.LAUNCHER 1
```

O app deve abrir na tela de login, chamando o backend local através do `adb reverse` configurado no passo anterior.

### Repetindo o ciclo após alterar código

Sempre que alterar código do Angular e quiser refletir no APK: rode `npm run mobile` de novo (ou repita manualmente a partir do passo 1: `build:mobile`, depois `assembleDebug`, depois reinstalar com `adb install -r`).
