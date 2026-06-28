import { NextResponse } from 'next/server';

// Static entries for now — replace with Prisma when migrating.
// ImageData is served as public URL; if you switch to base64 storage, use the /api/restricted/image route.

const ENTRIES: any[] = [
  // Active collection — 27 pieces
  {
    type: 'collection',
    data: {
      id: 'untitled-collection',
      title: 'Untitled Collection',
      category: 'Conceptual',
      tags: ['series'],
      cover: '/restricted/untitled-collection/1.webp',
      images: [
        '/restricted/untitled-collection/1.webp',,
              '/restricted/untitled-collection/2.webp',,
              '/restricted/untitled-collection/3.webp',,
              '/restricted/untitled-collection/4.webp',,
              '/restricted/untitled-collection/5.webp',,
              '/restricted/untitled-collection/6.webp',,
              '/restricted/untitled-collection/7.webp',,
              '/restricted/untitled-collection/8.webp',,
              '/restricted/untitled-collection/9.webp',,
              '/restricted/untitled-collection/10.webp',,
              '/restricted/untitled-collection/11.webp',,
              '/restricted/untitled-collection/12.webp',,
              '/restricted/untitled-collection/13.webp',,
              '/restricted/untitled-collection/14.webp',,
              '/restricted/untitled-collection/15.webp',,
              '/restricted/untitled-collection/16.webp',,
              '/restricted/untitled-collection/17.webp',,
              '/restricted/untitled-collection/18.webp',,
              '/restricted/untitled-collection/19.webp',,
              '/restricted/untitled-collection/20.webp',,
              '/restricted/untitled-collection/21.webp',,
              '/restricted/untitled-collection/22.webp',,
              '/restricted/untitled-collection/23.webp',,
              '/restricted/untitled-collection/24.webp',,
              '/restricted/untitled-collection/25.webp',,
              '/restricted/untitled-collection/26.webp',,
              '/restricted/untitled-collection/27.webp',
      ],
      prompt: 'Coming soon — owner will fill in the prompt.',
      date: '2026-06-25',
    },
  },
rt { NextResponse } from 'next/server';

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
