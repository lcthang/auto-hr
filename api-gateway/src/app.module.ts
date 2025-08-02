import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumesModule } from './resumes/resumes.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseConfigService } from './database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Conditional MongoDB configuration
    ...(process.env.DATABASE_TYPE === 'mongodb' || !process.env.DATABASE_TYPE
      ? [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              uri: configService.get<string>(
                'MONGODB_URI',
                'mongodb://localhost:27017/auto_hr',
              ),
            }),
            inject: [ConfigService],
          }),
        ]
      : []),
    ResumesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseConfigService],
})
export class AppModule {}
