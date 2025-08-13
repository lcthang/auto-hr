import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  first_name?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  last_name?: string;

  @ApiProperty({
    description: 'User company',
    example: 'Acme Corp',
    required: false
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({
    description: 'User job title',
    example: 'Software Engineer',
    required: false
  })
  @IsOptional()
  @IsString()
  job_title?: string;

  @ApiProperty({
    description: 'Newsletter subscription preference',
    example: true,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  subscribe_newsletter?: boolean;

  @ApiProperty({
    description: 'User active status',
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
