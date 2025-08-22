const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
  data: {  // <-- Add 'data:' here
    email: 'alice@example.com',
    password: 'hashed_password_here',
    firstName: 'Alice',
    lastName: 'Johnson',
    twoFactorEnabled: true,
  },
});

  console.log('✅ Created user:', user);

  // Create a USD wallet for the user
  const wallet = await prisma.wallet.create({
    data: {
      userId: user.id,
      currency: 'USD',
      balance: 100.5,
    },
  });

  console.log('✅ Created wallet:', wallet);

  // Create a transaction
  const tx = await prisma.transaction.create({
    data: {
      amount: 25.0,
      currency: 'USD',
      type: 'debit',
      description: 'Test purchase',
      status: 'completed',
      walletId: wallet.id,
      initiatorId: user.id,
    },
  });

  console.log('✅ Created transaction:', tx);

  // Read all wallets with user info
  const wallets = await prisma.wallet.findMany({
    include: {
      user: true,
      transactions: true,
    },
  });

  console.log('📊 All wallets:', JSON.stringify(wallets, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());