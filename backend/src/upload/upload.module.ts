import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [UploadController],
})
export class UploadModule {}