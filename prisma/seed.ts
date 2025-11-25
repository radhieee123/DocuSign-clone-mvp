import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create dummy users
  const alex = await prisma.user.upsert({
    where: { email: 'alex@acme.com' },
    update: {},
    create: {
      name: 'Sender Alex',
      email: 'alex@acme.com',
      mockPassword: 'password123', // Plain text for mock purposes
    },
  });

  const blake = await prisma.user.upsert({
    where: { email: 'blake@acme.com' },
    update: {},
    create: {
      name: 'Signer Blake',
      email: 'blake@acme.com',
      mockPassword: 'password123', // Plain text for mock purposes
    },
  });

  console.log('✅ Created users:', { alex, blake });

  // Optionally create a sample document
  const sampleDoc = await prisma.document.create({
    data: {
      title: 'Sample Q3 Contract',
      senderId: alex.id,
      recipientId: blake.id,
      status: 'PENDING',
    },
  });

  console.log('✅ Created sample document:', sampleDoc);
  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
