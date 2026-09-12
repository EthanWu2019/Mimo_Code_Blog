
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const c = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Need a user id. Find admin user.
(async () => {
  const admin = await c.user.findFirst({
    where: { email: 'ethanwucz2019@gmail.com' },
    select: { id: true }
  });
  if (!admin) {
    console.log('admin user not found');
    process.exit(1);
  }
  // clean up any previous test messages
  await c.message.deleteMany({ where: { content: { startsWith: '[test]' } } });
  // create a short message + a long message
  await c.message.create({
    data: {
      authorId: admin.id,
      content: '[test] short message',
    },
  });
  await c.message.create({
    data: {
      authorId: admin.id,
      content: '[test] long message ' + 'word '.repeat(60),
    },
  });
  await c.message.create({
    data: {
      authorId: admin.id,
      content: '[test] URL https://example.com/very/long/path/that/could/cause/horizontal/overflow/if/not/wrapped',
    },
  });
  const count = await c.message.count();
  console.log('seeded 3 test messages; total in table:', count);
  process.exit(0);
})();
