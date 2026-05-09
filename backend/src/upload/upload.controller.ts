import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { memoryStorage } from 'multer';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadAndCreateProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProductDto,
  ) {
    if (!file) throw new BadRequestException('Se requiere una imagen del producto');
    const uploaded: any = await this.cloudinaryService.uploadProductImage(file, dto.name);
    const product = await this.productsService.create({
      ...dto,
      imageUrl: uploaded.secureUrl,
      cloudinaryPublicId: uploaded.publicId,
    });
    return { message: 'Producto creado exitosamente', product, image: uploaded };
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Se requiere una imagen');
    return this.cloudinaryService.uploadProductImage(file);
  }
}
