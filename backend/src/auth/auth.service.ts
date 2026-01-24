/**
 * Auth Service - Handles all authentication business logic
 * 
 * Responsibilities:
 * - User registration (signup)
 * - User authentication (login)
 * - JWT token generation
 * - Password verification
 */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  /**
   * Constructor - Inject required services
   * @param userService - For user database operations
   * @param jwtService - For generating JWT tokens
   */
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * @param signupDto - User registration data
   * @returns Object containing the new user and JWT token
   * @throws ConflictException if email already exists
   */
  async signup(signupDto: SignupDto): Promise<{ user: any; access_token: string }> {
    // Create the user (password hashing is handled in UserService)
    const user = await this.userService.create({
      email: signupDto.email,
      password: signupDto.password,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
    });

    // Generate JWT token for the new user so they're logged in immediately
    const access_token = this.generateToken(user.id, user.email);

    return {
      user,
      access_token,
    };
  }

  /**
   * Authenticate a user with email and password
   * @param loginDto - Login credentials (email + password)
   * @returns Object containing the user and JWT token
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<{ user: any; access_token: string }> {
    // Find user by email (with password field included)
    const user = await this.userService.findByEmail(loginDto.email);

    // If user not found, throw unauthorized
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare provided password with stored hash
    // bcrypt.compare handles the salt automatically
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      // Same error message to prevent user enumeration attacks
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const access_token = this.generateToken(user.id, user.email);

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  /**
   * Validate a user by ID - Used by JwtStrategy
   * After JWT is verified, this checks if the user still exists in database
   * @param userId - User ID from JWT payload
   * @returns The user object or null
   */
  async validateUser(userId: number): Promise<any> {
    return this.userService.findOne(userId);
  }

  /**
   * Generate a JWT access token
   * @param userId - User's database ID
   * @param email - User's email address
   * @returns Signed JWT token string
   * 
   * The token payload contains:
   * - sub (subject): the user ID - standard JWT claim
   * - email: user's email for convenience
   * 
   * Token expiration is configured in AuthModule (JwtModule.register)
   */
  private generateToken(userId: number, email: string): string {
    const payload = {
      sub: userId, // 'sub' is a standard JWT claim for subject identifier
      email: email,
    };

    return this.jwtService.sign(payload);
  }
}
