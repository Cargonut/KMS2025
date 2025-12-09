import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../core/user/entities/user.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}
