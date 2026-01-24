/**
 * JWT Strategy - Passport strategy for validating JWT tokens
 * 
 * This strategy is used by the JwtAuthGuard to:
 * 1. Extract the JWT token from the HTTP-only cookie
 * 2. Verify the token signature using the secret key
 * 3. Check if the token is expired
 * 4. Attach the user info to the request object
 * 
 * How it works:
 * - When a protected route is accessed, JwtAuthGuard activates this strategy
 * - The strategy extracts the token from the cookie
 * - If valid, the validate() method is called with the decoded payload
 * - The return value of validate() is attached to req.user
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AuthService } from '../../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor - Configure the JWT strategy
   * @param configService - For accessing environment variables
   * @param authService - For validating if user still exists
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // Call parent constructor with configuration options
    super({
      // Custom extractor function to get JWT from HTTP-only cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First try to get token from cookie
        (request: Request) => {
          const token = request?.cookies?.access_token;
          if (!token) {
            return null;
          }
          return token;
        },
        // Fallback: Also support Bearer token in Authorization header
        // This is useful for testing with Postman or other API clients
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // Don't ignore expiration - we want tokens to expire
      ignoreExpiration: false,
      // Secret key for verifying token signature
      // Must be the same secret used when signing the token
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-super-secret-key-change-in-production',
    });
  }

  /**
   * Validate the JWT payload
   * This method is called AFTER the token signature is verified
   * 
   * @param payload - The decoded JWT payload { sub: userId, email: string, iat, exp }
   * @returns User info to be attached to req.user
   * @throws UnauthorizedException if user no longer exists
   * 
   * The returned object will be available as req.user in controllers
   */
  async validate(payload: any) {
    // payload.sub contains the user ID (set in AuthService.generateToken)
    // We fetch the user from database to ensure they still exist
    // and to get the latest user data
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      // User was deleted after token was issued
      throw new UnauthorizedException('User no longer exists');
    }

    // Return user info - this will be available as req.user
    // We include userId separately for convenience
    return {
      userId: payload.sub,
      email: payload.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
