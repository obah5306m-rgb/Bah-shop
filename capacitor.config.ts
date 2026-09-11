import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bahbusiness.app',
  appName: 'BAH BUSINESS',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
