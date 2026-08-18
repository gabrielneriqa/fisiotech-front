export const environment = {
  production: true,
  // Build usada dentro do APK (Capacitor). Sem dev-proxy disponível, a URL
  // precisa ser absoluta. 'localhost' funciona tanto no emulador quanto num
  // celular físico via USB, desde que rode `adb reverse tcp:8081 tcp:8081`
  // apontando pra porta do backend antes de abrir o app.
  // Porta 8081 (não 8080) porque nesta máquina a 8080 já está ocupada por
  // outro programa (NVIDIA Broadcast) - ajuste se o backend rodar em outra
  // porta/máquina.
  // Quando o backend for hospedado de verdade, troque só esta URL e gere a
  // build de novo.
  apiUrl: 'http://localhost:8081',
};
