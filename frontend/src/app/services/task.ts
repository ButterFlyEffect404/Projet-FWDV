import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse, RegisterRequest, LoginRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Task {
  private apiUrl = `${environment.apiUrl}`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';
  private platformId = inject(PLATFORM_ID);

  // Signal for reactive state management
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
      //this.currentUser.set(this.getUserFromStorage());
  }
  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`);
  }
  private getUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      return null;
    }
  }
}
