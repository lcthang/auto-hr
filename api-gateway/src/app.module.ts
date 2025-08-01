import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumesModule } from './resumes/resumes.module';

@Module({
  imports: [ResumesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
