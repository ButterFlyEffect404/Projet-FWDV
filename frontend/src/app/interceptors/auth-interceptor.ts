/**
 * Auth Interceptor - Automatically handles HTTP requests for authentication
 * 
 * What it does:
 * 1. Adds withCredentials: true to all requests going to our API
 *    This ensures cookies are sent/received with each request
 * 2. Handles 401 Unauthorized responses (session expired)
 *    Redirects to login page when authentication fails
 * 
 * How interceptors work:
 * - They intercept every HTTP request/response
 * - You can modify requests before they're sent
 * - You can handle responses/errors globally
 * - Multiple interceptors form a chain
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Check if this request is going to our API
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  
  // Clone the request and add withCredentials for API requests
  // withCredentials: true is REQUIRED for cookies to work cross-origin
  let modifiedReq = req;
  
  if (isApiRequest) {
    modifiedReq = req.clone({
      withCredentials: true // Include cookies in cross-origin requests
    });
  }
  
  // Pass the request to the next handler and catch errors
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      // This means the session expired or user is not logged in
      if (error.status === 401) {
        // Don't redirect if already on login page (prevents infinite loop)
        if (!router.url.includes('/login')) {
          console.log('Session expired or unauthorized. Redirecting to login.');
          router.navigate(['/login']);
        }
      }
      
      // Re-throw the error so components can handle it too
      return throwError(() => error);
    })
  );
};
