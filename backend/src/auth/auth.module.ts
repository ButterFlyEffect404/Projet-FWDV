/**
 * Auth Module - Organizes all authentication-related components
 * 
 * This module:
 * - Imports UserModule to access user data
 * - Configures JWT token settings (secret, expiration)
 * - Registers Passport and JWT strategies
 * - Exports AuthService for use in other modules
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // Import ConfigModule so ConfigService is available for JwtStrategy
    ConfigModule,
    
    // Import UserModule to get access to UserService (needed for user operations)
    UserModule,
    
    // PassportModule enables Passport.js integration
    // defaultStrategy: 'jwt' means use JWT strategy by default
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JwtModule.registerAsync for async configuration (to use ConfigService)
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access env variables
      useFactory: async (configService: ConfigService) => ({
        // Get JWT secret from environment variables
        // Falls back to a default (CHANGE THIS IN PRODUCTION!)
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-key-change-in-production',
        signOptions: {
          // Token expires in 7 days
          // After this, user needs to login again
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService], // Inject ConfigService into the factory function
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Register the JWT strategy as a provider
  ],
  exports: [AuthService], // Export AuthService so other modules can use it
})
export class AuthModule {}
