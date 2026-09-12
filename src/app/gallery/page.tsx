import type { Metadata } from 'next';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'Ai Gallery',
};

export default function Page() {
  return <GalleryClient />;
}
