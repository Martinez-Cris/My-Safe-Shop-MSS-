import { IsString, IsEmail, IsArray, ValidateNested, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString() productId: string;
  @IsInt() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @IsString() buyerName: string;
  @IsEmail() buyerEmail: string;
  @IsString() @IsOptional() buyerPhone?: string;
  @IsString() @IsOptional() shippingAddress?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items: OrderItemDto[];
}
