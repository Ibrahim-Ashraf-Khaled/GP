/// <reference lib="webworker" />
import { Serwist, NetworkFirst } from "serwist";
import { defaultCache } from "@serwist/turbopack/worker";

declare const self: ServiceWorkerGlobalScope;

declare global {
  interface ServiceWorkerGlobalScope {
    __SW_MANIFEST: Array<{ url: string; revision: string; type?: "complete" | "partial" }>;
  }
}

const supabaseCache = {
  matcher: ({ url, request }: { url: URL; request: Request }) => {
    return (
      url.hostname.endsWith("supabase.co") &&
      url.pathname.startsWith("/rest/v1/") &&
      request.method === "GET"
    );
  },
  handler: new NetworkFirst({
    cacheName: "supabase-api",
    networkTimeoutSeconds: 3,
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [...defaultCache, supabaseCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }: { request: Request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.addEventListeners();

export {};
