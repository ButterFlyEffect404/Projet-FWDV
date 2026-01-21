import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTaskDto } from './update-task.dto';

export class FilterTaskDto extends PartialType(UpdateTaskDto) {
  @IsOptional()
  @IsString()
  search?: string;

  // Override or add ID-based filters for the URL
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdById?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;
}