import type { Metadata } from 'next';
import PodcastClient from './PodcastClient';

export const metadata: Metadata = {
  title: 'Podcast',
};

export default function Page() {
  return <PodcastClient />;
}
