import { IsString, IsOptional, ValidateNested, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { User } from "src/user/entities/user.entity";

// Assuming you have a TaskStatus enum
export enum TaskStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export class FilterDto {

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @ValidateNested()
    @Type(() => User)
    assignedTo?: User;

    @IsOptional()
    @IsString()
    search?: string;
}