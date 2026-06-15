import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async findAll(categoryId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = categoryId ? { categoryId } : {};
    const [products, total] = await Promise.all([
      this.productsRepository.findAll({ skip, take: limit, where }),
      this.productsRepository.count(where),
    ]);
    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.productsRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 1,
      size: dto.size,
      brand: dto.brand,
      condition: dto.condition,
      imageUrl: dto.imageUrl,
      cloudinaryPublicId: dto.cloudinaryPublicId,
      category: { connect: { id: dto.categoryId } },
    });
  }

  async createWithImages(dto: {
    name: string;
    description: string;
    price: number;
    stock?: number;
    size?: string;
    brand?: string;
    condition?: string;
    categoryId: string;
    imageUrl?: string | null;
    images: { base64: string; order: number }[];
  }) {
    return this.productsRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 1,
      size: dto.size,
      brand: dto.brand,
      condition: dto.condition ?? 'GOOD',
      imageUrl: dto.imageUrl ?? null,
      category: { connect: { id: dto.categoryId } },
      images: {
        create: dto.images.map(img => ({
          base64: img.base64,
          order: img.order,
        })) as any,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.productsRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.productsRepository.softDelete(id);
  }
}