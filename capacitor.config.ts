import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bhurjalafurniture.erp',
  appName: 'Bhurjala Furniture',
  webDir: 'public',
  server: {
    // In production: replace with your live deployment URL (e.g. https://furniture-erp.vercel.app)
    // In development: points to local development server
    url: process.env.CAPACITOR_SERVER_URL || undefined,
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#DC4041',
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
