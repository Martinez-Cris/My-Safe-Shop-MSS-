import { IsString, IsNumber, IsOptional, IsPositive, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString() name: string;
  @IsString() description: string;

  @Transform(({ value }) => Number(value))
  @IsNumber() @IsPositive() price: number;

  @Transform(({ value }) => Number(value))
  @IsInt() @Min(0) @IsOptional() stock?: number;

  @IsString() @IsOptional() size?: string;
  @IsString() @IsOptional() brand?: string;
  @IsString() @IsOptional() condition?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() cloudinaryPublicId?: string;
  @IsString() categoryId: string;
}