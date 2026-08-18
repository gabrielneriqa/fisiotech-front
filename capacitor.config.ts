import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fisiotech.app',
  appName: 'FisioTech',
  webDir: 'dist/FisioTech-front/browser',
  server: {
    // http em vez do padrão https evita mixed-content ao chamar a API local em
    // texto puro (só pra esta build de demonstração local).
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
