import { InputType, Field, Float } from '@nestjs/graphql';
import { MotorType } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';

@InputType()
export class UpdateVehicleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  special_features?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  load_area?: number;

  @Field(() => MotorType, { nullable: true })
  @IsOptional()
  @IsEnum(MotorType)
  motor_type?: MotorType;

  @Field(() => [String], { nullable: 'itemsAndList' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_urls?: string[];
}
