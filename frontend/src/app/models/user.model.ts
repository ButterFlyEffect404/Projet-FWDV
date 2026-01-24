/**
 * User Model - Represents user data in the frontend
 * These interfaces define the shape of user-related data
 */

/**
 * User interface - Represents a user's public information
 * This matches what the backend returns (without password)
 */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: Date; // Optional - might not always be included
}

/**
 * AuthResponse - What the backend returns after login/signup
 * Note: access_token is stored in HTTP-only cookie, not returned in body
 * The backend still sends it for reference, but the cookie is the source of truth
 */
export interface AuthResponse {
  message: string;
  user: User;
}

/**
 * RegisterRequest - Data needed to create a new user account
 * Sent to POST /auth/signup
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * LoginRequest - Data needed to authenticate
 * Sent to POST /auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}