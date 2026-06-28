import { NextResponse } from 'next/server';

// Static entries for now — replace with Prisma when migrating.
// ImageData is served as public URL; if you switch to base64 storage, use the /api/restricted/image route.

const ENTRIES: any[] = [
  // Placeholder collection — owner will fill in images + prompt later
  {
    type: 'collection',
    data: {
      id: 'placeholder-collection',
      title: 'Untitled Collection',
      category: 'Conceptual',
      tags: ['placeholder'],
      cover: '/restricted/demo-01.webp',
      images: [],
      prompt: 'Coming soon — owner is preparing the collection.',
      date: '2026-06-25',
    },
  },
  {
    type: 'single',
    data: {
      id: 'demo-01',
      title: 'Untitled · 01',
      category: 'Conceptual',
      tags: ['demo'],
      imageUrl: '/restricted/demo-01.webp?v=1782624222',
      prompt: 'Conceptual piece — placeholder prompt. Will be set when uploaded.',
      date: '2026-06-25',
    },
  },
  {
    type: 'single',
    data: {
      id: 'demo-02',
      title: 'Untitled · 02',
      category: 'Experimental',
      tags: ['demo'],
      imageUrl: '/restricted/demo-02.webp?v=1782624222',
      prompt: 'Experimental piece — placeholder prompt. Will be set when uploaded.',
      date: '2026-06-25',
    },
  },
];

export async function GET() {
  return NextResponse.json({ entries: ENTRIES });
}
