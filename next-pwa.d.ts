import { NextConfig } from 'next';

declare module 'next-pwa' {
    interface PWAConfig {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        scope?: string;
        sw?: string;
        role?: string;
        skipWaiting?: boolean;
        runtimeCaching?: any[];
        publicExcludes?: string[];
        buildExcludes?: string[];
        cacheOnFrontEndNav?: boolean;
        reloadOnOnline?: boolean;
        subdomainPrefix?: string;
        [key: string]: any;
    }

    export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
