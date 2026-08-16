import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Resetting all entry data...');

  // 1. Delete payments
  const payments = await prisma.payment.deleteMany();
  console.log(`Deleted ${payments.count} payments`);

  // 2. Delete bill items
  const billItems = await prisma.billItem.deleteMany();
  console.log(`Deleted ${billItems.count} bill items`);

  // 3. Delete bills
  const bills = await prisma.bill.deleteMany();
  console.log(`Deleted ${bills.count} bills`);

  // 4. Delete material usages
  const materialUsages = await prisma.materialUsage.deleteMany();
  console.log(`Deleted ${materialUsages.count} material usages`);

  // 5. Delete projects
  const projects = await prisma.project.deleteMany();
  console.log(`Deleted ${projects.count} projects`);

  // 6. Delete attendance
  const attendance = await prisma.attendance.deleteMany();
  console.log(`Deleted ${attendance.count} attendance records`);

  // 7. Delete employees
  const employees = await prisma.employee.deleteMany();
  console.log(`Deleted ${employees.count} employees`);

  // 8. Delete products
  const products = await prisma.product.deleteMany();
  console.log(`Deleted ${products.count} products`);

  // 9. Delete customers
  const customers = await prisma.customer.deleteMany();
  console.log(`Deleted ${customers.count} customers`);

  // Ensure Admin user exists
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user verified:', admin.email);
  console.log('Database entry data reset complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Error resetting database entries:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
