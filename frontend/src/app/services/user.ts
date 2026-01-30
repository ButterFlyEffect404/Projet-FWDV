/**
 * User Service - Handles user-related operations in the frontend
 * 
 * Features:
 * - Get all users (for task assignment dropdown)
 * - Get user by ID
 * - User profile management
 * 
 * Note: Authentication is handled by the Auth service
 * This service is for user data operations
 */
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Base URL for user endpoints
  private apiUrl = `${environment.apiUrl}/user`;
  
  /**
   * Signal to store all users (for task assignment)
   * Components can subscribe to this for reactive updates
   */
  users = signal<User[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Get all users in the system
   * Used for task assignment dropdown
   * 
   * Endpoint: GET /user
   * @returns Observable with array of users
   */
  getAllUsers(): Observable<User[]> {
    return this.http
      .get<User[] | { success?: boolean; data?: User[] }>(this.apiUrl, {
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          if (Array.isArray(res)) return res;
          if (res?.data && Array.isArray(res.data)) return res.data;
          return [];
        }),
        tap((users) => this.users.set(users)),
      );
  }

  /**
   * Get a specific user by their ID
   * 
   * Endpoint: GET /user/:id
   * @param id - User ID to fetch
   * @returns Observable with user data
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Get the current user's profile (protected route)
   * 
   * Endpoint: GET /user/profile
   * @returns Observable with current user's data
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      withCredentials: true
    });
  }

  /**
   * Update user information
   * 
   * Endpoint: PATCH /user/:id
   * @param id - User ID to update
   * @param data - Partial user data to update
   * @returns Observable with updated user
   */
  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data, {
      withCredentials: true
    });
  }
}
