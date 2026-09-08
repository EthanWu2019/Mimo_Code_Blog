'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  // OAuth + Create account buttons share the same color treatment that
  // flips with the active theme, so all primary actions look uniform.
  const primaryBtn =
    theme === 'dark'
      ? 'bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-200 dark:border-white/[0.08]'
      : 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-900';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registration successful but login failed. Please try logging in.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Create account</h1>
          <p className="text-sm text-zinc-500 dark:text-white/40">Get started with your free account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-white/50 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-white/50 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-white/50 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-white/20 text-sm"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${primaryBtn}`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 grid gap-2.5">
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className={`w-full inline-flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${primaryBtn}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l8 6.2C12.3 13.3 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4 6.9-9.9 6.9-17.6z"/>
              <path fill="#FBBC05" d="M10.5 28.5c-.6-1.8-1-3.7-1-5.7s.4-3.9 1-5.7l-8-6.2C.9 14.4 0 18.1 0 22c0 3.9.9 7.6 2.5 10.9l8-6.4z"/>
              <path fill="#34A853" d="M24 46c6.2 0 11.4-2 15.2-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.6 2.3-6.3 0-11.7-3.8-13.5-9.4l-8 6.2C6.4 42.6 14.6 46 24 46z"/>
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => signIn('github', { callbackUrl: '/' })}
            className={`w-full inline-flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${primaryBtn}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4C16.4 4.7 17.4 5 17.4 5c.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9 0-6.3-5.2-11.5-11.5-11.5z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-white/30">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-900 dark:text-white font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
