import type { Metadata } from 'next';
import RestrictedClient from './RestrictedClient';

export const metadata: Metadata = {
  title: 'Restricted',
};

export default function Page() {
  return <RestrictedClient />;
}
