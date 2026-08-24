import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma =
  (globalForPrisma.prisma && (globalForPrisma.prisma as any).staffPayment && (globalForPrisma.prisma as any).estimate)
    ? globalForPrisma.prisma
    : (() => {
        const client = createPrismaClient()
        if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
        return client
      })()

export default prisma

