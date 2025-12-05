import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../../core/user/user.service';
import { AuthService } from '../../auth/auth.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UpdatePasswordInput } from '../../core/user/dto/update-password.input';
import { UpdateUserInput } from '../../core/user/dto/update-user.input';
import { CreateUserInput } from '../../core/user/dto/create-user.input';
import { User } from '../../core/user/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';


@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
  ) { }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }


  @Mutation(() => User, { nullable: true })
  async signup(@Args('data') data: CreateUserInput): Promise<User | null> {
    const passwordHash = await this.auth.hashPassword(data.password);

    try {
      return await this.userService.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        birth_date: data.birth_date,
        phone: data.phone,
        profile_image: data.profile_image,
        additional_note: data.additional_note,
        passwordHash,
      });
    } catch (err: any) {
      // Mercurius MUSS explizit mit einem Error abbrechen
      throw new Error(err.message);
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteMe(
    @CurrentUser() user: any,
    @Args('password') password: string,
  ) {
    const foundUser = await this.userService.findOne(user.id);

    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.auth.comparePasswords(
      password,
      foundUser.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.userService.deleteUser(user.id);
    return true;
  }




  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const user = await this.auth.validateUser(email, password);
    return (await this.auth.login(user)).accessToken;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: any) {
    return this.userService.findOne(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  updateMe(
    @CurrentUser() user: any,
    @Args('data') data: UpdateUserInput,
  ) {
    return this.userService.updateUser(user.id, data);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async updatePassword(
    @CurrentUser() user: any,
    @Args('data') data: UpdatePasswordInput,
  ) {
    return this.userService.updatePassword(
      user.id,
      data.oldPassword,
      data.newPassword,
    );
  }
}
