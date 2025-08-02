import { IsOptional, IsString } from 'class-validator';

export class ResumeUploadDto {
  @IsOptional()
  @IsString()
  description?: string;
}
