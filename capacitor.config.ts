import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onmangequoi.app',
  appName: 'onmangequoi-ui',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000',
    cleartext: true
  }
};

export default config;
