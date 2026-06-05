import { PrismaClient, Condition, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de MY SAFE SHOP...');

// Pega esto entre el console.log y el const [abrigos, vestidos...]
const hashedPassword = await bcrypt.hash('admin123', 10);
await prisma.user.upsert({
  where: { email: 'admin@mysafeshop.com' },
  update: {},
  create: {
    name: 'Administrador',
    email: 'admin@mysafeshop.com',
    password: hashedPassword,
    role: Role.ADMIN,
    phone: '+57 300 000 0000',
    city: 'Bogotá',
  },
});
console.log('Admin creado: admin@mysafeshop.com / admin123');

  const [abrigos, vestidos, jeans, zapatos, accesorios] = await Promise.all([
    prisma.category.upsert({ where: { slug: 'abrigos' }, update: {}, create: { name: 'Abrigos & Chaquetas', slug: 'abrigos', description: 'Prendas de abrigo de segunda mano' } }),
    prisma.category.upsert({ where: { slug: 'vestidos' }, update: {}, create: { name: 'Vestidos', slug: 'vestidos', description: 'Vestidos para toda ocasion' } }),
    prisma.category.upsert({ where: { slug: 'jeans' }, update: {}, create: { name: 'Jeans & Pantalones', slug: 'jeans', description: 'Denim y pantalones casuales' } }),
    prisma.category.upsert({ where: { slug: 'zapatos' }, update: {}, create: { name: 'Zapatos', slug: 'zapatos', description: 'Calzado de todo tipo' } }),
    prisma.category.upsert({ where: { slug: 'accesorios' }, update: {}, create: { name: 'Accesorios', slug: 'accesorios', description: 'Bolsos, cinturones y mas' } }),
  ]);

  const products = [
    { name: 'Abrigo de Lana Zara Camel', description: 'Abrigo largo de lana premium en color camel. Talla M. Usado solo 2 veces, como nuevo.', price: 85000, stock: 1, size: 'M', brand: 'Zara', condition: Condition.LIKE_NEW, categoryId: abrigos.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg' },
    { name: 'Vestido Floral HyM Primavera', description: 'Hermoso vestido floral midi de H&M. Talla S. Perfecto para eventos casuales.', price: 45000, stock: 1, size: 'S', brand: 'H&M', condition: Condition.GOOD, categoryId: vestidos.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg' },
    { name: 'Jeans Skinny Levis 511 Azul Oscuro', description: 'Clasico jean Levis 511 slim fit en azul oscuro. Talla 30x30. Excelente estado.', price: 65000, stock: 2, size: '30x30', brand: 'Levis', condition: Condition.GOOD, categoryId: jeans.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.png' },
    { name: 'Botines de Cuero Steve Madden Negro', description: 'Botines de cuero genuino con tacon de 5cm. Talla 38. Usados pocas veces.', price: 120000, stock: 1, size: '38', brand: 'Steve Madden', condition: Condition.LIKE_NEW, categoryId: zapatos.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg' },
    { name: 'Bolso de Mano Coach Nude', description: 'Bolso Coach de cuero color nude con herrajes dorados. Viene con bolsa de tela original.', price: 200000, stock: 1, size: 'Unico', brand: 'Coach', condition: Condition.GOOD, categoryId: accesorios.id, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg' },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`Producto creado: ${product.name}`);
  }

  console.log('Seed completado! 5 productos listos.');
}

main()
  .catch((e) => { console.error('Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
