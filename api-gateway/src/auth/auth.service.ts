import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string) {
    if (email === 'admin@recruitryte.com' && password === 'password') {
      return { status: 'ok' };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
