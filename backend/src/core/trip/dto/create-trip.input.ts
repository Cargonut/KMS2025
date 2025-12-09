import { InputType, Field, Int, Float, GraphQLISODateTime } from '@nestjs/graphql';
import { TripType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateTripInput {
  @Field(() => TripType)
  @IsEnum(TripType)
  type: TripType;

  @Field()
  @IsString()
  from_location: string;

  @Field()
  @IsString()
  to_location: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  via?: string;

  // ⬇️ WICHTIG: GraphQLISODateTime + Transform + IsDate
  @Field(() => GraphQLISODateTime)
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  vehicle_id?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  weight?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  seats?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  restrictions?: string;
}
