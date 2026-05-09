import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { CloudinaryService } from './cloudinary.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule {}
