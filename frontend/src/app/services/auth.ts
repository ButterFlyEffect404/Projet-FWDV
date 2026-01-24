/**
 * Auth Service - Handles all authentication operations in the frontend
 * 
 * Features:
 * - User registration (signup)
 * - User login
 * - User logout
 * - Profile fetching
 * - Authentication state management using Angular signals
 * 
 * HTTP-Only Cookies:
 * The JWT token is stored in an HTTP-only cookie by the backend.
 * This means:
 * - JavaScript cannot access the token directly (more secure)
 * - The browser automatically sends the cookie with every request
 * - We need to set withCredentials: true in HTTP requests
 */
import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse, RegisterRequest, LoginRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // Base URL for auth endpoints
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Key for storing user data in localStorage (not the token!)
  private readonly USER_KEY = 'current_user';
  
  // Platform detection for SSR compatibility
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  /**
   * Signal for reactive state management
   * Components can subscribe to this to react to auth state changes
   * Example: currentUser() in a template will auto-update when user logs in/out
   */
  currentUser = signal<User | null>(null);
  
  /**
   * Signal to track if the user is authenticated
   * This is checked by calling /auth/me endpoint on app init
   */
  isLoggedIn = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // On app load (browser only), try to restore user from storage
    // and verify if the session is still valid
    if (this.isBrowser) {
      this.currentUser.set(this.getUserFromStorage());
      // Check if user is actually logged in (cookie might be valid)
      this.checkAuthStatus();
    }
  }

  /**
   * Register a new user
   * @param data - Registration data (email, password, firstName, lastName)
   * @returns Observable with auth response
   * 
   * Endpoint: POST /auth/signup
   * The backend will set the JWT cookie automatically
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data, {
      withCredentials: true // IMPORTANT: Include cookies in request/response
    }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Login an existing user
   * @param data - Login credentials (email, password)
   * @returns Observable with auth response
   * 
   * Endpoint: POST /auth/login
   * The backend will set the JWT cookie automatically
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data, {
      withCredentials: true // IMPORTANT: Include cookies in request/response
    }).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  /**
   * Logout the current user
   * Calls the backend to clear the HTTP-only cookie
   * 
   * Endpoint: POST /auth/logout
   */
  logout(): void {
    // Call backend to clear the cookie
    this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.clearLocalState();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if backend call fails, clear local state
        this.clearLocalState();
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Get the current user's profile from the backend
   * @returns Observable with user data
   * 
   * Endpoint: GET /user/profile (protected)
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/profile`, {
      withCredentials: true
    }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        this.saveUserToStorage(user);
      })
    );
  }

  /**
   * Check if user is authenticated
   * With HTTP-only cookies, we can't directly check the token
   * We rely on the isLoggedIn signal and stored user data
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  /**
   * Check authentication status by calling /auth/me
   * This verifies if the cookie is still valid
   * Called on app initialization
   */
  checkAuthStatus(): void {
    this.http.get<{ user: User }>(`${this.apiUrl}/me`, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        // Cookie is valid, user is logged in
        this.currentUser.set(response.user);
        this.isLoggedIn.set(true);
        this.saveUserToStorage(response.user);
      },
      error: () => {
        // Cookie is invalid or expired
        this.clearLocalState();
      }
    });
  }

  /**
   * Handle successful authentication (login/register)
   * @param response - Auth response from backend
   */
  private handleAuthSuccess(response: AuthResponse): void {
    // Store user data locally (not the token - it's in the cookie)
    this.currentUser.set(response.user);
    this.isLoggedIn.set(true);
    this.saveUserToStorage(response.user);
  }

  /**
   * Clear all local authentication state
   * Called on logout or when session expires
   */
  private clearLocalState(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  /**
   * Save user data to localStorage for persistence
   * @param user - User data to save
   */
  private saveUserToStorage(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Retrieve user data from localStorage
   * @returns Stored user data or null
   */
  private getUserFromStorage(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      return null;
    }
  }
}