import type { Metadata } from 'next';
import PhotographyClient from './PhotographyClient';

export const metadata: Metadata = {
  title: 'Photography',
};

export default function Page() {
  return <PhotographyClient />;
}
