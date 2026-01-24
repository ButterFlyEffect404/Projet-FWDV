/**
 * User Controller - Handles HTTP requests for user-related routes
 * Controllers define the routes and delegate work to services
 * 
 * Routes:
 * - GET /user          -> Get all users (for task assignment)
 * - GET /user/profile  -> Get current logged-in user's profile (protected)
 * - GET /user/:id      -> Get a specific user by ID
 * - PATCH /user/:id    -> Update a user (protected)
 * - DELETE /user/:id   -> Delete a user (protected)
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@Controller('user') // Base route: /user
export class UserController {
  /**
   * Inject UserService via constructor
   * NestJS handles the instantiation automatically (Dependency Injection)
   */
  constructor(private readonly userService: UserService) {}

  /**
   * GET /user/profile
   * Returns the profile of the currently logged-in user
   * Protected route - requires valid JWT token in cookie
   * 
   * The @Request() decorator gives us access to the Express request object
   * req.user is populated by the JwtAuthGuard after token validation
   */
  @UseGuards(JwtAuthGuard) // Protect this route - must be logged in
  @Get('profile')
  async getProfile(@Request() req) {
    // req.user contains the user info from the JWT token (set by JwtStrategy)
    // Fetch fresh user data from database to ensure it's up to date
    return this.userService.findOne(req.user.userId);
  }

  /**
   * GET /user
   * Returns all users in the system
   * Used for features like: selecting a user to assign a task to
   * This route is NOT protected so frontend can display user list
   */
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  /**
   * GET /user/:id
   * Returns a specific user by their ID
   * Example: GET /user/5 returns user with id=5
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // +id converts string to number (shorthand for parseInt)
    return this.userService.findOne(+id);
  }

  /**
   * PATCH /user/:id
   * Update a user's information
   * Protected route - only authenticated users can update
   * Note: In a real app, you'd also check if user is updating their own profile
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * DELETE /user/:id
   * Delete a user from the system
   * Protected route - requires authentication
   * Note: In a real app, you'd add authorization (admin only, etc.)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
