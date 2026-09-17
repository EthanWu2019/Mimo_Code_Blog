/**
 * Shared TypeScript types for Project entities. Used both by the
 * Prisma client (server) and by the page UI (client) so they always
 * agree on shape.
 */

export type ProjectCategory =
  | 'web'
  | 'ml'
  | 'mobile'
  | 'systems'
  | 'tooling'
  | 'experiment';

export type ProjectStatus = 'shipped' | 'in-progress' | 'archived';

export type ProjectTier = 'major' | 'vibe';

export interface ProjectDetailSection {
  heading: string;
  body: string;
}

export interface ProjectChapterLink {
  label: string;
  href: string;
}

export interface ProjectChapter {
  /** Timeline label, e.g. '2020', 'Contribution 01', 'Live'. */
  era: string;
  heading: string;
  body: string;
  /** True = this chapter is the owner's own contribution. Renders a
   *  "MY CONTRIBUTION" badge. */
  contribution: boolean;
  links?: ProjectChapterLink[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  tier: ProjectTier;
  status: ProjectStatus;
  tech: string[];
  highlights?: string[];
  link?: string | null;
  repo?: string | null;
  coverImage?: string | null;
  featured: boolean;
  sortOrder: number;
  year: number;
  createdAt?: string;
  updatedAt?: string;
  /** Structured case-study sections, rendered as a masonry card grid
   *  on the detail page. Falls back to plain description when absent. */
  detailSections?: ProjectDetailSection[];
  /** Personal narrative, rendered as a timeline. */
  story?: string[];
  /** Linear narrative chapters — the preferred detail-page layout.
   *  One timeline: story and technical contributions in the same
   *  flow, each chapter optionally flagged as a contribution and
   *  carrying highlighted links. */
  chapters?: ProjectChapter[];
}

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: 'Web',
  ml: 'ML / AI',
  mobile: 'Mobile',
  systems: 'Systems',
  tooling: 'Tooling',
  experiment: 'Experiment',
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: 'Shipped',
  'in-progress': 'In progress',
  archived: 'Archived',
};

export const STATUS_STYLE: Record<ProjectStatus, string> = {
  shipped: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  'in-progress':
    'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  archived: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
};

export const VALID_CATEGORIES: ProjectCategory[] = [
  'web',
  'ml',
  'mobile',
  'systems',
  'tooling',
  'experiment',
];

export const VALID_STATUSES: ProjectStatus[] = ['shipped', 'in-progress', 'archived'];

export const VALID_TIERS: ProjectTier[] = ['major', 'vibe'];
