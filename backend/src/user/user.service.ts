/**
 * User Service - Contains all business logic for user operations
 * Services are where the actual work happens (database queries, data processing)
 * Controllers handle HTTP requests and delegate to services
 */
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable() // Makes this class injectable via NestJS dependency injection
export class UserService {
  /**
   * Constructor - Inject the User repository
   * @InjectRepository(User) tells NestJS to inject the TypeORM repository for User entity
   * Repository provides methods like find(), save(), delete() for database operations
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with hashed password
   * @param createUserDto - User data from request body
   * @returns The created user (without password)
   * @throws ConflictException if email already exists
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if a user with this email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // 409 Conflict - Resource already exists
      throw new ConflictException('A user with this email already exists');
    }

    // Hash the password before saving (NEVER store plain text passwords!)
    // Salt rounds = 10 is a good balance between security and performance
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create a new user instance with the hashed password
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save to database and return (password won't be included due to select: false)
    const savedUser = await this.userRepository.save(newUser);
    
    // Remove password from returned object for extra safety
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  /**
   * Find all users - Used for user listing (e.g., task assignment dropdown)
   * @returns Array of all users (without passwords)
   */
  async findAll(): Promise<User[]> {
    // password is automatically excluded due to select: false in entity
    return this.userRepository.find();
  }

  /**
   * Find a single user by ID
   * @param id - User ID
   * @returns The user if found
   * @throws NotFoundException if user doesn't exist
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email - Used for authentication
   * This method explicitly selects the password field for login verification
   * @param email - User's email address
   * @returns User with password field included, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    // We need to explicitly select password for authentication
    // addSelect adds password to the query since it's excluded by default
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Include password for login verification
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Update a user's information
   * @param id - User ID to update
   * @param updateUserDto - Fields to update
   * @returns Updated user
   * @throws NotFoundException if user doesn't exist
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // First check if user exists
    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Merge the updates into the existing user
    Object.assign(user, updateUserDto);

    // Save and return updated user
    return this.userRepository.save(user);
  }

  /**
   * Delete a user by ID
   * @param id - User ID to delete
   * @throws NotFoundException if user doesn't exist
   */
  async remove(id: number): Promise<void> {
    // Check if user exists first
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
