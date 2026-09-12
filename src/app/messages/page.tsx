import type { Metadata } from 'next';
import MessagesBoard from './MessagesClient';

export const metadata: Metadata = {
  title: 'Messages',
  description:
    'A small guestbook on ethanwu.work — sign in to leave a short note. Newest first.',
};

// Server shell. Owns the metadata so the route gets a real title
// ("Ethan Wu · Messages") instead of falling back to the bare
// default while the client component hydrates. The actual board
// logic lives in MessagesBoard (the previous 'use client' page,
// renamed).
export default function MessagesPage() {
  return <MessagesBoard />;
}
