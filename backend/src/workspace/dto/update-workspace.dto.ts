import { IsString, IsOptional, MaxLength, MinLength, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  members?: number[];
}
