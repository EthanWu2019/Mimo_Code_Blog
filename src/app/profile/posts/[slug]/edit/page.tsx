import type { Metadata } from 'next';
import EditPostClient from './EditPostClient';

export const metadata: Metadata = {
  title: 'Edit Post',
};

export default function Page() {
  return <EditPostClient />;
}
