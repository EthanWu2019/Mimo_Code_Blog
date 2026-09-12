import type { Metadata } from 'next';
import PostClient from './PostClient';

export const metadata: Metadata = {
  title: 'Post',
};

export default function Page() {
  return <PostClient />;
}
