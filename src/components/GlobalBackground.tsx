'use client';

export default function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37, 99, 235, 0.08), transparent)',
      }}
    />
  );
}
