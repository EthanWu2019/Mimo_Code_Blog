import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'Blog',
};

export default function Page() {
  return <BlogClient />;
}
