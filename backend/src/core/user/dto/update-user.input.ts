import { InputType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { IsOptional, IsString, IsDate } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  first_name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  last_name?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  birth_date?: Date;


  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  profile_image?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additional_note?: string;
}
