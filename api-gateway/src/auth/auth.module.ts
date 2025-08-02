import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthService } from './jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import { SupabaseModule } from '../database/supabase.module';
import { DatabaseConfigService } from '../database/database.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    // Conditional MongoDB import
    ...(process.env.DATABASE_TYPE === 'mongodb' || !process.env.DATABASE_TYPE
      ? [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])]
      : []),
    // Conditional Supabase import
    ...(process.env.DATABASE_TYPE === 'supabase' ? [SupabaseModule] : []),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthService, JwtStrategy, DatabaseConfigService],
  exports: [AuthService, JwtAuthService, JwtStrategy],
})
export class AuthModule {}
