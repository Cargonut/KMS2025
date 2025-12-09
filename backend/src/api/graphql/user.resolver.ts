import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from '../../auth/auth.service';
import { AuthResponse } from '../../auth/entities/auth-response.entity';
import { LoginInput } from '../../auth/dto/login.input';

import { User } from '../../core/user/entities/user.entity';
import { CreateUserInput } from '../../core/user/dto/create-user.input';
import { UserService } from '../../core/user/user.service';

import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

import { UpdateUserInput } from '../../core/user/dto/update-user.input';


@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  // -------------------------------
  // LOGIN
  // -------------------------------
  @Mutation(() => AuthResponse)
  async login(
    @Args('data', { type: () => LoginInput }) data: LoginInput,
  ) {
    return this.authService.login(data);
  }

  // -------------------------------
  // SIGNUP
  // -------------------------------
  @Mutation(() => User)
  async signup(
    @Args('data', { type: () => CreateUserInput }) data: CreateUserInput,
  ) {
    return this.userService.create(data);
  }

  // -------------------------------
  // CURRENT USER
  // -------------------------------
  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: User) {
    return user;
  }

  // -------------------------------
  // UPDATE ME
  // -------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async updateMe(
    @CurrentUser() user: User,
    @Args('data', { type: () => UpdateUserInput }) data: UpdateUserInput,
  ) {
    return this.userService.updateUser(user.id, data);
  }


  // -------------------------------
  // UPDATE PASSWORD
  // -------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async updatePassword(
    @CurrentUser() user: User,
    @Args('oldPassword') oldPassword: string,
    @Args('newPassword') newPassword: string,
  ) {
    await this.userService.updatePassword(
      user.id,
      oldPassword,
      newPassword,
    );

    return true;
  }

  // -------------------------------
  // DELETE ME
  // -------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteMe(
    @CurrentUser() user: User,
    @Args('password') password: string,
  ) {
    // 1️⃣ Echten User aus DB holen (inkl. passwordHash)
    const dbUser = await this.userService.findByEmail(user.email);

    if (!dbUser) {
      throw new Error('User not found');
    }

    // 2️⃣ Passwort prüfen
    const valid = await this.authService.comparePasswords(
      password,
      dbUser.passwordHash,
    );

    if (!valid) {
      throw new Error('Password incorrect.');
    }

    // 3️⃣ User löschen
    await this.userService.deleteUser(dbUser.id);

    return true;
  }
}
