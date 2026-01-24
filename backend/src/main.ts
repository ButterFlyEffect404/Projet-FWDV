/**
 * Main Entry Point - Bootstrap the NestJS application
 * 
 * This file:
 * - Creates the NestJS application instance
 * - Configures global settings (CORS, validation, cookies)
 * - Starts the HTTP server
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor';

async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule);

  /**
   * Enable Cookie Parser middleware
   * This is REQUIRED for reading cookies (including our JWT token)
   * Without this, req.cookies will be undefined
   */
  app.use(cookieParser());

  /**
   * Enable CORS (Cross-Origin Resource Sharing)
   * This allows the frontend (running on a different port) to call our API
   * 
   * Options explained:
   * - origin: Which domains can access our API (frontend URL)
   * - credentials: true -> Allow cookies to be sent cross-origin
   * - methods: HTTP methods allowed
   * - allowedHeaders: Headers the frontend can send
   */
  app.enableCors({
    // Allow requests from frontend (adjust URL/port as needed)
    // In development, Angular typically runs on port 4200
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true, // IMPORTANT: Required for cookies to work cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  /**
   * Global Validation Pipe
   * This automatically validates incoming request data against DTOs
   * 
   * Options explained:
   * - whitelist: true -> Strip properties that aren't in the DTO
   * - forbidNonWhitelisted: true -> Throw error if unknown properties are sent
   * - transform: true -> Automatically transform payloads to DTO instances
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unknown properties from request body
      forbidNonWhitelisted: true, // Throw error if unknown properties are sent
      transform: true, // Transform plain objects to class instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types (e.g., string "1" to number 1)
      },
    }),
  );

  // Get port from environment variable or default to 3000
  const port = process.env.PORT || 3000;
  
  // Start the server
  await app.listen(port);
  
  // Log the server URL
  console.log(`🚀 Backend server running on: http://localhost:${port}`);
  console.log(`📝 API endpoints:`);
  console.log(`   - POST /auth/signup  -> Register new user`);
  console.log(`   - POST /auth/login   -> Login user`);
  console.log(`   - POST /auth/logout  -> Logout user`);
  console.log(`   - GET  /auth/me      -> Get current user (protected)`);
  console.log(`   - GET  /user         -> Get all users`);
  console.log(`   - GET  /user/profile -> Get user profile (protected)`);
}
bootstrap();