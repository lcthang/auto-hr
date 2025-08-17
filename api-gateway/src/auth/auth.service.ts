import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { JwtAuthService } from './jwt.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, LoginResponseDto } from './dto/auth-response.dto';
import { SupabaseService } from '../database/supabase.service';

// Helper function to safely extract user ID
function extractUserId(user: any): string {
  return user.id || user._id || '';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    @Optional() private readonly supabaseService?: SupabaseService,
  ) {}

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    return this.registerSupabase(registerDto)
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.loginSupabase(loginDto)
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtAuthService.verifyRefreshToken(refreshToken);

      let user;
      if (!this.supabaseService) {
        throw new Error('Supabase service is not available');
      }
      user = await this.supabaseService.findUserById(payload.sub);

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
          firstName: user.first_name,
          lastName: user.last_name,
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

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtAuthService.verifyToken(token);

      let user;
      if (!this.supabaseService) {
        throw new Error('Supabase service is not available');
      }
      user = await this.supabaseService.findUserById(payload.sub);

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

  async getProfile(userId: string): Promise<any> {
    let user;
    if (!this.supabaseService) {
      throw new Error('Supabase service is not available');
    }
    user = await this.supabaseService.findUserById(userId);

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
    if (!this.supabaseService) {
      throw new Error('Supabase service is not available');
    }
    user = await this.supabaseService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isOldPasswordValid = await user.validatePassword(oldPassword);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (!this.supabaseService) {
      throw new Error('Supabase service is not available');
    }
    await this.supabaseService.updateUser(userId, { password: newPassword });

    return {
      status: 'success',
      message: 'Password changed successfully',
    };
  }

  // Supabase specific methods
  private async registerSupabase(registerDto: RegisterDto): Promise<LoginResponseDto> {
    if (!this.supabaseService) {
      throw new Error('Supabase service is not available');
    }

    // Check if user profile already exists
    const existingUser = await this.supabaseService.findUserByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create the user profile using the service role key (bypasses RLS)
    const savedUser = await this.supabaseService!.createUser(registerDto);
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
        firstName: user.first_name,
        lastName: user.last_name,
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
