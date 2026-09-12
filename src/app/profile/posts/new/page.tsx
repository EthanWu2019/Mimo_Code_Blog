import type { Metadata } from 'next';
import NewPostClient from './NewPostClient';

export const metadata: Metadata = {
  title: 'New Post',
};

export default function Page() {
  return <NewPostClient />;
}
