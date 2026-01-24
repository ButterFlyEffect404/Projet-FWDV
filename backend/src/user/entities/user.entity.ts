/**
 * User Entity - Represents the 'user' table in the database
 * This entity defines the structure of user data stored in MySQL
 * TypeORM decorators map this class to database columns
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users') // Table name in database will be 'users'
export class User {
  /**
   * Primary key - Auto-generated unique identifier for each user
   * TypeORM will automatically increment this value for new records
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * User's email address - Must be unique across all users
   * Used for login authentication
   */
  @Column({ unique: true })
  email: string;

  /**
   * User's password - Stored as bcrypt hash (NEVER store plain text!)
   * The 'select: false' option means this field won't be returned in queries by default
   * You need to explicitly select it when needed (like during login)
   */
  @Column({ select: false })
  password: string;

  /**
   * User's first name - Required field
   */
  @Column()
  firstName: string;

  /**
   * User's last name - Required field
   */
  @Column()
  lastName: string;

  /**
   * Timestamp when the user account was created
   * TypeORM automatically sets this when a new record is inserted
   */
  @CreateDateColumn()
  createdAt: Date;
}
