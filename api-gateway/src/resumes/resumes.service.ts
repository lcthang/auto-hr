import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ResumeMetadata {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  skills?: string[];
  experience?: string;
  education?: string;
}

export interface ProcessedResume {
  id: string;
  filename: string;
  content: string;
  metadata: ResumeMetadata;
  vectorId?: string;
  createdAt: Date;
}

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(private readonly httpService: HttpService) {}

  async processResume(file: Express.Multer.File): Promise<ProcessedResume> {
    this.logger.log(`Processing resume: ${file.originalname}`);

    // Extract text content from PDF
    const content = await this.extractTextFromPDF(file.buffer);

    // Extract metadata from content
    const metadata = await this.extractMetadata(content);

    // Store in MongoDB
    const resumeData: ProcessedResume = {
      id: this.generateId(),
      filename: file.originalname,
      content,
      metadata,
      createdAt: new Date(),
    };

    await this.storeInMongoDB(resumeData);

    // Store embeddings in Supabase Vector DB
    const vectorId = await this.storeInVectorDB(resumeData);
    resumeData.vectorId = vectorId;

    this.logger.log(`Resume processed successfully: ${file.originalname}`);
    return resumeData;
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      // Call FastAPI LLM service for PDF text extraction
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/extract-pdf-text', {
          pdf_data: buffer.toString('base64'),
        }),
      );

      return response.data.text;
    } catch (error) {
      this.logger.error('Failed to extract text from PDF', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async extractMetadata(content: string): Promise<ResumeMetadata> {
    try {
      // Call FastAPI LLM service for metadata extraction
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/extract-metadata', {
          content,
        }),
      );

      return response.data.metadata;
    } catch (error) {
      this.logger.error('Failed to extract metadata', error);
      // Return basic metadata extraction as fallback
      return this.extractBasicMetadata(content);
    }
  }

  private extractBasicMetadata(content: string): ResumeMetadata {
    const metadata: ResumeMetadata = {};

    // Basic email extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailRegex);
    if (emails && emails.length > 0) {
      metadata.email = emails[0];
    }

    // Basic phone extraction
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = content.match(phoneRegex);
    if (phones && phones.length > 0) {
      metadata.phone = phones[0];
    }

    // Basic name extraction (first line that looks like a name)
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length > 2 && firstLine.length < 50) {
        metadata.name = firstLine;
      }
    }

    return metadata;
  }

  private async storeInMongoDB(resumeData: ProcessedResume): Promise<void> {
    try {
      // Call MongoDB service to store resume data
      await firstValueFrom(
        this.httpService.post('http://localhost:8000/store-resume', resumeData),
      );
    } catch (error) {
      this.logger.error('Failed to store in MongoDB', error);
      throw new Error('Failed to store resume in database');
    }
  }

  private async storeInVectorDB(resumeData: ProcessedResume): Promise<string> {
    try {
      // Call Supabase Vector DB service to store embeddings
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/store-vector', {
          content: resumeData.content,
          metadata: resumeData.metadata,
          resumeId: resumeData.id,
        }),
      );

      return response.data.vectorId;
    } catch (error) {
      this.logger.error('Failed to store in Vector DB', error);
      // Don't throw error for vector storage failure, just log it
      return "";
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
