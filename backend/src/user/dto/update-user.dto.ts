/**
 * Update User DTO
 * PartialType makes all fields from CreateUserDto optional
 * This allows partial updates (e.g., only updating firstName)
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // All fields from CreateUserDto are inherited but optional
  // You can add additional update-specific fields here if needed
}
