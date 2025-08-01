import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string) {
    if (email === 'lecongthang.1102@gmail.com' && password === 'password') {
      return { status: 'ok' };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
