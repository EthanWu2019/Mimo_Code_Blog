import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin', 12);
  console.log('Admin password hash:', adminPassword);

  await prisma.comment.deleteMany();
  await prisma.$executeRawUnsafe('DELETE FROM "_PostToTag"');
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      id: 'clseed001',
      email: 'admin@blog.com',
      name: 'Ethan Wu',
      password: adminPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.email);

  const tagNames = ['react', 'nextjs', 'typescript', 'javascript', 'css', 'design', 'performance', 'architecture', 'tutorial', 'career', 'devops', 'database', 'ai', 'testing', 'security'];
  await Promise.all(
    tagNames.map((name, i) =>
      prisma.tag.create({ data: { id: `t${String(i + 1).padStart(2, '0')}`, name } })
    )
  );
  console.log('Created', tagNames.length, 'tags');

  const posts = [
    { id: 'p01', title: 'Building Scalable React Applications with Modern Architecture', slug: 'scalable-react-architecture', excerpt: 'Learn how to architect React applications that scale gracefully.', viewCount: 1247, tags: ['react', 'architecture', 'performance'], days: 30 },
    { id: 'p02', title: 'The Complete Guide to Next.js App Router', slug: 'nextjs-app-router-guide', excerpt: 'A deep dive into Next.js App Router.', viewCount: 2156, tags: ['nextjs', 'react', 'tutorial'], days: 28 },
    { id: 'p03', title: 'TypeScript Best Practices for React Developers', slug: 'typescript-react-best-practices', excerpt: 'Master TypeScript patterns for React development.', viewCount: 1893, tags: ['typescript', 'react', 'tutorial'], days: 25 },
    { id: 'p04', title: 'CSS-in-JS vs Utility-First Comparison', slug: 'css-in-js-vs-utility-first', excerpt: 'Understanding different CSS approaches in React.', viewCount: 1567, tags: ['css', 'design', 'react'], days: 23 },
    { id: 'p05', title: 'Mastering React Performance Optimization', slug: 'react-performance-optimization', excerpt: 'Practical techniques for performance bottlenecks.', viewCount: 3421, tags: ['react', 'performance', 'tutorial'], days: 21 },
    { id: 'p06', title: 'Building a Design System with React and Tailwind', slug: 'design-system-react-tailwind', excerpt: 'Creating a reusable component library.', viewCount: 1876, tags: ['design', 'react', 'css'], days: 19 },
    { id: 'p07', title: 'Server-Side Rendering vs Static Generation in 2026', slug: 'ssr-vs-ssg-2026', excerpt: 'Understanding modern rendering strategies.', viewCount: 2234, tags: ['nextjs', 'performance', 'architecture'], days: 17 },
    { id: 'p08', title: 'React Testing Strategies That Actually Work', slug: 'react-testing-strategies', excerpt: 'Building a testing strategy that provides confidence.', viewCount: 1654, tags: ['testing', 'react', 'tutorial'], days: 15 },
    { id: 'p09', title: 'Database Design Patterns for Web Applications', slug: 'database-design-patterns', excerpt: 'Essential database patterns for web apps.', viewCount: 1432, tags: ['database', 'architecture', 'performance'], days: 13 },
    { id: 'p10', title: 'The Art of Clean Code in React', slug: 'clean-code-react', excerpt: 'Principles for writing React code that lasts.', viewCount: 1987, tags: ['react', 'javascript', 'architecture'], days: 11 },
    { id: 'p11', title: 'Deploying React Applications to Production', slug: 'deploying-react-production', excerpt: 'A guide to deploying with confidence.', viewCount: 1345, tags: ['nextjs', 'devops', 'performance'], days: 9 },
    { id: 'p12', title: 'Authentication and Authorization in React Apps', slug: 'react-auth-guide', excerpt: 'Implementing secure auth patterns.', viewCount: 2567, tags: ['react', 'security', 'typescript'], days: 7 },
    { id: 'p13', title: 'State Management in 2026: Beyond Redux', slug: 'state-management-2026', excerpt: 'Modern state management solutions.', viewCount: 2890, tags: ['react', 'architecture', 'typescript'], days: 5 },
    { id: 'p14', title: 'Building Accessible React Components', slug: 'accessible-react-components', excerpt: 'Creating components usable by everyone.', viewCount: 1543, tags: ['react', 'design', 'tutorial'], days: 3 },
    { id: 'p15', title: 'API Design Patterns for Full-Stack React Apps', slug: 'api-design-patterns', excerpt: 'Designing intuitive and maintainable APIs.', viewCount: 1234, tags: ['nextjs', 'architecture', 'database'], days: 2 },
    { id: 'p16', title: 'React Hooks: Advanced Patterns and Pitfalls', slug: 'react-hooks-advanced', excerpt: 'Deepening your understanding of React Hooks.', viewCount: 2345, tags: ['react', 'javascript', 'tutorial'], days: 1 },
    { id: 'p17', title: 'Micro-Frontends with React', slug: 'micro-frontends-react', excerpt: 'When and how to implement micro-frontends.', viewCount: 987, tags: ['react', 'architecture', 'devops'], days: 0 },
    { id: 'p18', title: 'The Future of React', slug: 'future-of-react', excerpt: 'Upcoming React features and the future of web dev.', viewCount: 3456, tags: ['react', 'nextjs', 'ai'], days: 0 },
    { id: 'p19', title: 'DevOps for Frontend Developers', slug: 'devops-frontend-developers', excerpt: 'Essential DevOps knowledge for frontend devs.', viewCount: 1678, tags: ['devops', 'career', 'performance'], days: 0 },
    { id: 'p20', title: 'Building Real-Time Applications with React', slug: 'real-time-react-applications', excerpt: 'Techniques for responsive real-time apps.', viewCount: 2123, tags: ['react', 'javascript', 'architecture'], days: 0 },
  ];

  const content = `This is a comprehensive article covering essential concepts, best practices, and practical techniques that every developer should know.

The field of software engineering is constantly evolving, and staying up-to-date with the latest patterns and practices is crucial for building high-quality applications.

Whether you are a beginner or an experienced developer, this article has something for you. We cover fundamental concepts, explore advanced techniques, and provide practical examples.

One of the key challenges in modern software development is managing complexity. As applications grow, it becomes important to adopt patterns that help manage this complexity effectively.

Performance is another critical consideration. Users expect applications to be fast and responsive, and even small delays can significantly impact user experience.

Testing is an essential part of the development process. This article covers testing strategies that provide real confidence without slowing down development.

Finally, we look at the broader ecosystem and discuss how these technologies are evolving. Understanding the direction of the industry helps you make informed decisions.`;

  for (const p of posts) {
    await prisma.post.create({
      data: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        content,
        excerpt: p.excerpt,
        published: true,
        authorId: 'clseed001',
        viewCount: p.viewCount,
        createdAt: new Date(Date.now() - p.days * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: { connect: p.tags.map((t) => ({ name: t })) },
      },
    });
  }
  console.log('Created', posts.length, 'posts');
  console.log('Seed completed!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
