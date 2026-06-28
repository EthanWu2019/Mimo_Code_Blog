import { NextResponse } from 'next/server';

// Static entries for now — replace with Prisma when migrating.
// ImageData is served as public URL; if you switch to base64 storage, use the /api/restricted/image route.

const ENTRIES: any[] = [
  // Active collection — 2 pieces from same prompt set
  {
    type: 'collection',
    data: {
      id: 'untitled-collection',
      title: 'Untitled Collection',
      category: 'Conceptual',
      tags: ['series'],
      cover: '/restricted/untitled-collection/1.webp',
      images: [
        '/restricted/untitled-collection/1.webp',
        '/restricted/untitled-collection/2.webp',
      ],
      prompt: 'Coming soon — owner will fill in the prompt.',
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
