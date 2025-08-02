import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumesService } from './resumes.service';
import { ResumeUploadDto } from './dto/resume-upload.dto';

@Controller('api/resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('resume'))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: ResumeUploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    try {
      const result = await this.resumesService.processResume(file);
      return {
        success: true,
        message: 'Resume uploaded and processed successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to process resume: ${error.message}`,
      );
    }
  }
}
