import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../core/user/user.service';
import { GraphQLError } from 'graphql';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './entities/auth-response.entity';


@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new GraphQLError('Invalid credentials', {
        extensions: {
          code: 'UNAUTHORIZED',
          statusCode: 401,
        },
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new GraphQLError('Invalid credentials', {
        extensions: {
          code: 'UNAUTHORIZED',
          statusCode: 401,
        },
      });
    }

    const { passwordHash, ...rest } = user;
    return rest;
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // 1. User validieren
    const user = await this.userService.findByEmail(data.email);

    if (!user) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'UNAUTHORIZED', statusCode: 401 },
      });
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValid) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'UNAUTHORIZED', statusCode: 401 },
      });
    }

    // 2. Token generieren
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    // 3. Password entfernen
    const { passwordHash, ...rest } = user;

    // 4. Response im neuen Format zurückgeben
    return {
      token,
      user: rest,
    };
  }


  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
