/**
 * Auth Guard - Protects routes that require authentication
 * 
 * How route guards work:
 * - Guards run before navigating to a route
 * - Return true to allow navigation
 * - Return false to block navigation
 * - Return UrlTree to redirect to another route
 * 
 * Usage in app.routes.ts:
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  // Inject required services
  const authService = inject(Auth);
  const router = inject(Router);

  // Check if user is authenticated using the service's signal
  if (authService.isAuthenticated()) {
    // User is logged in, allow access to the route
    return true;
  }

  // User is not logged in, redirect to login page
  // Store the attempted URL so we can redirect back after login
  console.log('Access denied. User not authenticated. Redirecting to login.');
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } // Pass the original URL as query param
  });
  return false;
};