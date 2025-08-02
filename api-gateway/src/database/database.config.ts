import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum DatabaseType {
  MONGODB = 'mongodb',
  SUPABASE = 'supabase',
}

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  getDatabaseType(): DatabaseType {
    const dbType = this.configService.get<string>('DATABASE_TYPE', 'mongodb');
    return dbType as DatabaseType;
  }

  isMongoDB(): boolean {
    return this.getDatabaseType() === DatabaseType.MONGODB;
  }

  isSupabase(): boolean {
    return this.getDatabaseType() === DatabaseType.SUPABASE;
  }

  getMongoDBUri(): string {
    return this.configService.get<string>(
      'MONGODB_URI',
      'mongodb://localhost:27017/auto_hr',
    );
  }

  getSupabaseUrl(): string {
    return this.configService.get<string>('SUPABASE_URL', '');
  }

  getSupabaseKey(): string {
    return this.configService.get<string>('SUPABASE_ANON_KEY', '');
  }
}
