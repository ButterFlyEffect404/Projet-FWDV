/**
 * User Module - Organizes user-related components
 * Modules are the building blocks of NestJS applications
 * They group related controllers, services, and entities together
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature() registers the User entity for this module
    // This allows us to inject the User repository into UserService
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController], // Register the controller
  providers: [UserService], // Register the service as a provider
  exports: [UserService], // Export UserService so other modules (like AuthModule) can use it
})
export class UserModule {}
