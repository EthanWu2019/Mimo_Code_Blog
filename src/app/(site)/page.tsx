import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Home',
};

export default function Page() {
  return <HomeClient />;
}
