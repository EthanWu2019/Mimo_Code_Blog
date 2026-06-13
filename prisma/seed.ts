import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: {
      email: 'admin@blog.com',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  console.log('Created user:', user);

  const post = await prisma.post.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello World',
      slug: 'hello-world',
      content: 'Welcome to your new blog! This is your first post. You can edit or delete it from the admin panel.',
      excerpt: 'Welcome to your new blog!',
      published: true,
      authorId: user.id,
      tags: {
        connectOrCreate: [
          { where: { name: 'welcome' }, create: { name: 'welcome' } },
          { where: { name: 'blog' }, create: { name: 'blog' } },
        ],
      },
    },
  });

  console.log('Created post:', post);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
