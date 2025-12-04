import { Injectable, UnauthorizedException, Inject, forwardRef, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../core/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash, ...rest } = user;
    return rest;
  }

  async login(user: { id: number; email: string }) {
    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
