import { IsNotEmpty, IsString, MaxLength, MinLength, IsDate, IsOptional, ValidateNested, IsUUID, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { User } from "src/user/entities/user.entity";

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

    @IsEnum(['LOW', 'MEDIUM', 'HIGH']) // Added here
    @IsNotEmpty()
    priority: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => User) // Ensures the plain object is transformed into a User instance
    assignedTo?: User;

    // Usually, createdBy is handled by the Request user in the Controller, 
    // but if you're passing an ID or object:
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => User)
    createdBy: User;

    @IsNotEmpty()
    @IsDate() 
    @Type(() => Date) // Crucial: Converts the incoming ISO string into a JS Date object
    dueDate: Date;
}