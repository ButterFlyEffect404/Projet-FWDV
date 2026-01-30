import { IsNotEmpty, IsString, MaxLength, MinLength, IsDate, IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  description: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  @IsNotEmpty()
  priority: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  assignedToId?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  workspaceId: number;

  @IsOptional()
  @IsEnum(['TODO', 'IN_PROGRESS', 'DONE'])
  status?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;
}