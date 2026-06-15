import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key:    this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadProductImage(file: Express.Multer.File, productName?: string) {
    if (!file) throw new BadRequestException('No se recibio ningun archivo');
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(`Formato no permitido: ${file.mimetype}`);
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('El archivo excede 10MB');
    }
    const folder = this.config.get<string>('CLOUDINARY_FOLDER') || 'my-safe-shop/products';
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
          public_id: productName
            ? `${Date.now()}-${productName.toLowerCase().replace(/\s+/g, '-')}`
            : undefined,
        },
        (error, result: UploadApiResponse) => {
          if (error) reject(new BadRequestException(`Error al subir imagen: ${error.message}`));
          else resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
          });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleImages(files: Express.Multer.File[], productName?: string): Promise<any[]> {
    if (!files || files.length === 0) throw new BadRequestException('Se requiere al menos una imagen');
    if (files.length > 3) throw new BadRequestException('Máximo 3 imágenes por producto');
    return Promise.all(files.map(file => this.uploadProductImage(file, productName)));
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}