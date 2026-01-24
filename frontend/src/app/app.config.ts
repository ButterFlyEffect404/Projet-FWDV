/**
 * Application Configuration
 * 
 * This file configures the Angular application providers.
 * Providers are services that Angular can inject into components.
 * 
 * Key configurations:
 * - Router: Handles page navigation
 * - HTTP Client: For making API calls
 * - Interceptors: Modify HTTP requests/responses globally
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Global error listener for uncaught errors
    provideBrowserGlobalErrorListeners(),
    
    // Router configuration - handles page navigation
    provideRouter(routes), 
    
    // Client hydration for server-side rendering (SSR)
    provideClientHydration(withEventReplay()),
    
    /**
     * HTTP Client configuration
     * - withFetch(): Use the Fetch API instead of XMLHttpRequest
     * - withInterceptors([authInterceptor]): Add our auth interceptor
     * 
     * The auth interceptor:
     * - Adds withCredentials: true to include cookies
     * - Handles 401 errors by redirecting to login
     */
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};
