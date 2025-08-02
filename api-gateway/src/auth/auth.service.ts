import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { JwtAuthService } from './jwt.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, LoginResponseDto } from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfigService } from '../database/database.config';
import { SupabaseService } from '../database/supabase.service';

// Helper function to safely extract user ID
function extractUserId(user: any): string {
  return user.id || user._id || '';
}

// Helper function to safely get SupabaseService
function getSupabaseService(service: SupabaseService | undefined): SupabaseService {
  if (!service) {
    throw new Error('Supabase service is not available');
  }
  return service;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtAuthService: JwtAuthService,
    private readonly configService: ConfigService,
    private readonly databaseConfigService: DatabaseConfigService,
    @Optional() private readonly supabaseService?: SupabaseService,
  ) {}

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    if (this.databaseConfigService.isMongoDB()) {
      return this.registerMongoDB(registerDto);
    } else {
      if (!this.supabaseService) {
        throw new Error('Supabase service is not available');
      }
      return this.registerSupabase(registerDto);
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    if (this.databaseConfigService.isMongoDB()) {
      return this.loginMongoDB(loginDto);
    } else {
      if (!this.supabaseService) {
        throw new Error('Supabase service is not available');
      }
      return this.loginSupabase(loginDto);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtAuthService.verifyRefreshToken(refreshToken);

      let user;
      if (this.databaseConfigService.isMongoDB()) {
        user = await this.userModel.findById(payload.sub).exec();
      } else {
        if (!this.supabaseService) {
          throw new Error('Supabase service is not available');
        }
        user = await this.supabaseService.findUserById(payload.sub);
      }

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtAuthService.generateAccessToken(user);
      const newRefreshToken = this.jwtAuthService.generateRefreshToken(user);
      const expiresIn = this.jwtAuthService.getTokenExpirationTime();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
        user: {
          id: extractUserId(user),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtAuthService.verifyToken(token);

      let user;
      if (this.databaseConfigService.isMongoDB()) {
        user = await this.userModel.findById(payload.sub).exec();
      } else {
        if (!this.supabaseService) {
          throw new Error('Supabase service is not available');
        }
        user = await this.supabaseService.findUserById(payload.sub);
      }

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logout(userId: string): Promise<{ status: string; message: string }> {
    return {
      status: 'success',
      message: 'Logged out successfully',
    };
  }

  async getProfile(userId: string): Promise<User> {
    let user;
    if (this.databaseConfigService.isMongoDB()) {
      user = await this.userModel.findById(userId).exec();
    } else {
      if (!this.supabaseService) {
        throw new Error('Supabase service is not available');
      }
      user = await this.supabaseService.findUserById(userId);
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ status: string; message: string }> {
    let user;
    if (this.databaseConfigService.isMongoDB()) {
      user = await this.userModel.findById(userId).exec();
    } else {
      if (!this.supabaseService) {
        throw new Error('Supabase service is not available');
      }
      user = await this.supabaseService.findUserById(userId);
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isOldPasswordValid = await user.validatePassword(oldPassword);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (this.databaseConfigService.isMongoDB()) {
      user.password = newPassword;
      await user.save();
    } else {
      if (!this.supabaseService) {
        throw new Error('Supabase service is not available');
      }
      await this.supabaseService.updateUser(userId, { password: newPassword });
    }

    return {
      status: 'success',
      message: 'Password changed successfully',
    };
  }

  // MongoDB specific methods
  private async registerMongoDB(
    registerDto: RegisterDto,
  ): Promise<LoginResponseDto> {
    const existingUser = await this.userModel
      .findOne({ email: registerDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = new this.userModel({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      phoneNumber: registerDto.phoneNumber,
    });

    const savedUser = await user.save();
    return this.createAuthResponse(savedUser, 'User registered successfully');
  }

  private async loginMongoDB(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .select('+password')
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user, 'Login successful');
  }

  // Supabase specific methods
  private async registerSupabase(
    registerDto: RegisterDto,
  ): Promise<LoginResponseDto> {
    if (!this.supabaseService) {
      throw new Error('Supabase service is not available');
    }
    const existingUser = await this.supabaseService.findUserByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const userData = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password, // Will be hashed by Supabase auth
      phoneNumber: registerDto.phoneNumber,
    };

    const savedUser = await this.supabaseService!.createUser(userData);
    return this.createAuthResponse(savedUser, 'User registered successfully');
  }

  private async loginSupabase(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.supabaseService!.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // For Supabase, you might want to use their auth system instead
    // This is a simplified version - in production, use Supabase Auth
    const isPasswordValid = await this.validatePasswordSupabase(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user, 'Login successful');
  }

  private async validatePasswordSupabase(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hashedPassword);
  }

  private createAuthResponse(user: any, message: string): LoginResponseDto {
    const accessToken = this.jwtAuthService.generateAccessToken(user);
    const refreshToken = this.jwtAuthService.generateRefreshToken(user);
    const expiresIn = this.jwtAuthService.getTokenExpirationTime();

    const authResponse: AuthResponseDto = {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: extractUserId(user),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    return {
      status: 'success',
      message,
      data: authResponse,
    };
  }
}
