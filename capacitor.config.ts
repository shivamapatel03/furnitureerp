import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bhurjalafurniture.erp',
  appName: 'Bhurjala Furniture',
  webDir: 'public',
  server: {
    url: 'https://furnitureerp.vercel.app',
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#DC4041',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#DC4041',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
