/**
 * Auth Controller - Handles HTTP requests for authentication routes
 * 
 * Routes:
 * - POST /auth/signup  -> Register a new user
 * - POST /auth/login   -> Login and get JWT token (stored in HTTP-only cookie)
 * - POST /auth/logout  -> Logout (clear the cookie)
 * 
 * HTTP-Only Cookies:
 * We store the JWT in an HTTP-only cookie for security:
 * - HTTP-only: JavaScript cannot access it (prevents XSS attacks)
 * - Secure: Only sent over HTTPS in production
 * - SameSite: Prevents CSRF attacks
 */
import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth') // Base route: /auth
export class AuthController {
  /**
   * Inject AuthService via constructor
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   * Register a new user account
   * 
   * Request body: { email, password, firstName, lastName }
   * Response: { user, message }
   * Sets: access_token cookie
   * 
   * @param signupDto - Registration data from request body
   * @param res - Express response object (for setting cookies)
   */
  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) res: Response, // passthrough: true allows returning data AND setting cookies
  ) {
    // Call auth service to create user and get token
    const { user, access_token } = await this.authService.signup(signupDto);

    // Set the JWT token in an HTTP-only cookie
    this.setTokenCookie(res, access_token);

    // Return success response (token is in the cookie, not in response body)
    return {
      message: 'User registered successfully',
      user,
    };
  }

  /**
   * POST /auth/login
   * Authenticate user and issue JWT token
   * 
   * Request body: { email, password }
   * Response: { user, message }
   * Sets: access_token cookie
   * 
   * @param loginDto - Login credentials from request body
   * @param res - Express response object (for setting cookies)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Return 200 instead of default 201 for POST
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Authenticate user and get token
    const { user, access_token } = await this.authService.login(loginDto);

    // Set the JWT token in an HTTP-only cookie
    this.setTokenCookie(res, access_token);

    // Return success response
    return {
      message: 'Login successful',
      user,
    };
  }

  /**
   * POST /auth/logout
   * Clear the authentication cookie
   * 
   * No request body needed
   * Response: { message }
   * Clears: access_token cookie
   * 
   * Note: This is a POST request (not GET) for security reasons
   * GET requests can be triggered by images/links, POST cannot
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie by setting it with an expired date
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax', // CSRF protection
      expires: new Date(0), // Set to past date to delete the cookie
      path: '/', // Cookie available for all routes
    });

    return {
      message: 'Logout successful',
    };
  }

  /**
   * GET /auth/me
   * Get the currently authenticated user's info
   * This is a convenience endpoint to check if user is logged in
   * 
   * Protected route - requires valid JWT token
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    // req.user is set by JwtStrategy after token validation
    return {
      user: req.user,
    };
  }

  /**
   * Helper method to set the JWT token as an HTTP-only cookie
   * @param res - Express response object
   * @param token - JWT token string
   * 
   * Cookie options explained:
   * - httpOnly: true -> JavaScript cannot read this cookie (XSS protection)
   * - secure: true in production -> Cookie only sent over HTTPS
   * - sameSite: 'lax' -> Cookie sent with same-site and top-level navigations (CSRF protection)
   * - maxAge: 7 days in milliseconds -> Cookie expiration
   * - path: '/' -> Cookie available for all routes
   */
  private setTokenCookie(res: Response, token: string): void {
    res.cookie('access_token', token, {
      httpOnly: true, // Prevents JavaScript from accessing the cookie (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production only
      sameSite: 'lax', // Provides some CSRF protection while allowing normal navigation
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/', // Cookie is valid for all routes
    });
  }
}
