import type { Metadata } from 'next';
import SleepClient from './SleepClient';

export const metadata: Metadata = {
  title: 'Sleep',
};

export default function Page() {
  return <SleepClient />;
}
