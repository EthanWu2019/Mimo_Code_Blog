import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Register',
};

export default function Page() {
  return <RegisterClient />;
}
