import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  
  console.log('Admin user created:', admin.email)

  // Add demo products if none exist
  const count = await prisma.product.count()
  if (count === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Plywood 18mm', category: 'Wood', unit: 'Sheet', sellingPrice: 2000, purchasePrice: 1700, stock: 50, lowStockLimit: 10 },
        { name: 'Laminate 1mm', category: 'Laminates', unit: 'Sheet', sellingPrice: 1200, purchasePrice: 900, stock: 100, lowStockLimit: 20 },
        { name: 'Hinges Soft Close', category: 'Hardware', unit: 'Pcs', sellingPrice: 250, purchasePrice: 180, stock: 200, lowStockLimit: 50 },
        { name: 'Handle 6 inch', category: 'Hardware', unit: 'Pcs', sellingPrice: 150, purchasePrice: 90, stock: 150, lowStockLimit: 30 },
        { name: 'MDF 12mm', category: 'Wood', unit: 'Sheet', sellingPrice: 1500, purchasePrice: 1200, stock: 40, lowStockLimit: 10 },
      ]
    })
    console.log('Demo products created.')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
