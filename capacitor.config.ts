import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.quikshopping.pos',
    appName: 'Quik Shopping',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
