/**
 * Signup DTO - Data Transfer Object for user registration
 * This is essentially the same as CreateUserDto
 * We create a separate DTO for clarity and potential future differences
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  /**
   * User's email address - Must be valid email format
   * @example "newuser@example.com"
   */
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  /**
   * User's password - Minimum 6 characters
   * @example "securePassword123"
   */
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  /**
   * User's first name
   * @example "Jane"
   */
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  /**
   * User's last name
   * @example "Smith"
   */
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;
}
