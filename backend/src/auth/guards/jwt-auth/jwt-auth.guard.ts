/**
 * JWT Auth Guard - Protects routes that require authentication
 * 
 * Usage: Add @UseGuards(JwtAuthGuard) decorator to controllers or routes
 * 
 * How it works:
 * 1. When a protected route is accessed, this guard is activated
 * 2. It delegates to the Passport 'jwt' strategy (JwtStrategy)
 * 3. If the token is valid, the request proceeds
 * 4. If invalid or missing, a 401 Unauthorized error is thrown
 * 
 * Example:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 *   return req.user; // User info is available here
 * }
 */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * canActivate - Determines if the current request can proceed
   * This is called automatically by NestJS when the guard is used
   * 
   * We override this to add custom error handling
   */
  canActivate(context: ExecutionContext) {
    // Call the parent class method to trigger Passport authentication
    // This will call our JwtStrategy's validate method
    return super.canActivate(context);
  }

  /**
   * handleRequest - Handle the result of Passport authentication
   * This is called after canActivate completes
   * 
   * @param err - Any error that occurred during authentication
   * @param user - The user object returned from JwtStrategy.validate()
   * @param info - Additional info from Passport (e.g., token expired message)
   * @returns The user object if authentication succeeded
   * @throws UnauthorizedException if authentication failed
   */
  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, authentication failed
    if (err || !user) {
      // Provide helpful error messages based on what went wrong
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Your session has expired. Please login again.');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }
      // Generic error for missing token or other issues
      throw new UnauthorizedException('You must be logged in to access this resource.');
    }
    
    // Return the user object - it will be attached to req.user
    return user;
  }
}
