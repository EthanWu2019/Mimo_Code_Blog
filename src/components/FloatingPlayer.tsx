'use client';

import { useState } from 'react';

interface Episode {
  id: number;
  number: number;
  title: string;
  duration: string;
}

export default function FloatingPlayer({
  episode,
  isPlaying,
  onTogglePlay,
}: {
  episode: Episode;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Invisible full-screen backdrop — click to collapse */}
      {expanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Player container */}
      <div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50"
        style={{
          width: expanded ? 300 : 56,
          height: expanded ? 'auto' : 56,
          minHeight: 56,
          borderRadius: expanded ? 20 : 28,
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          background: expanded
            ? undefined
            : 'rgba(255,255,255,0.08)',
          boxShadow: expanded
            ? '0 8px 40px rgba(0,0,0,0.35)'
            : '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        {expanded ? (
          <div
            className="p-5 bg-white/[0.08] dark:bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] dark:border-white/[0.08]"
            style={{ borderRadius: 20 }}
          >
            {/* Now Playing label */}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-400">
              Now Playing
            </span>

            {/* Title */}
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate mt-2 mb-0.5">
              {episode.title}
            </p>

            {/* Episode number + duration */}
            <p className="text-[11px] text-zinc-500 dark:text-white/40 mb-4">
              EP {episode.number} · {episode.duration}
            </p>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-zinc-400 dark:text-white/30 tabular-nums">
                12:34
              </span>
              <div className="flex-1 h-1 rounded-full bg-white/[0.1] overflow-hidden">
                <div className="h-full w-[35%] rounded-full bg-violet-500" />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-white/30 tabular-nums">
                {episode.duration}
              </span>
            </div>

            {/* Controls: skip back, play/pause, skip forward */}
            <div className="flex items-center justify-center gap-4">
              {/* Skip back */}
              <button className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>

              {/* Play / Pause */}
              <button
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center hover:bg-violet-500 transition-colors"
              >
                {isPlaying ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white"
                  >
                    <rect
                      x="6"
                      y="4"
                      width="4"
                      height="16"
                      rx="1"
                      fill="currentColor"
                    />
                    <rect
                      x="14"
                      y="4"
                      width="4"
                      height="16"
                      rx="1"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white ml-0.5"
                  >
                    <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                  </svg>
                )}
              </button>

              {/* Skip forward */}
              <button className="text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed: circular play/pause button */
          <button
            onClick={() => setExpanded(true)}
            className="w-full h-full flex items-center justify-center bg-white/[0.08] dark:bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] dark:border-white/[0.08]"
            style={{ borderRadius: 28 }}
          >
            {isPlaying ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-violet-500 dark:text-violet-400"
              >
                <rect
                  x="6"
                  y="4"
                  width="4"
                  height="16"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="14"
                  y="4"
                  width="4"
                  height="16"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-violet-500 dark:text-violet-400 ml-0.5"
              >
                <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
              </svg>
            )}
          </button>
        )}
      </div>
    </>
  );
}
