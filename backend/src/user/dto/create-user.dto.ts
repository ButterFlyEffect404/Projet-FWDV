/**
 * Create User DTO (Data Transfer Object)
 * DTOs define the shape of data coming from client requests
 * class-validator decorators provide automatic validation
 * If validation fails, NestJS returns a 400 Bad Request automatically
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  /**
   * User's email - Must be a valid email format
   * @example "john.doe@example.com"
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * User's password - Minimum 6 characters for security
   * Will be hashed before storing in database
   * @example "mySecurePassword123"
   */
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  /**
   * User's first name
   * @example "John"
   */
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  /**
   * User's last name
   * @example "Doe"
   */
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;
}
