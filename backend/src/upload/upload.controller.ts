import {
  Controller, Post, Body, BadRequestException
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../products/products.service';
import { IsString, IsArray, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProductWithImagesDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsNumber() @Min(1000) price: number;
  @IsNumber() @IsOptional() stock?: number;
  @IsString() @IsOptional() size?: string;
  @IsString() @IsOptional() brand?: string;
  @IsString() @IsOptional() condition?: string;
  @IsString() categoryId: string;
  @IsArray() images: string[];
}

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post('product')
  async createProductWithImages(@Body() dto: CreateProductWithImagesDto) {
    if (!dto.images || dto.images.length === 0) {
      throw new BadRequestException('Se requiere al menos una imagen');
    }
    if (dto.images.length > 3) {
      throw new BadRequestException('Máximo 3 imágenes por producto');
    }

    const product = await this.productsService.createWithImages({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 1,
      size: dto.size,
      brand: dto.brand,
      condition: dto.condition,
      categoryId: dto.categoryId,
      imageUrl: null,
      images: dto.images.map((base64, index) => ({ base64, order: index })),
    });

    return { message: 'Producto creado exitosamente', product };
  }
}