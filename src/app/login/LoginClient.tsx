'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { signInWithOverlay } from '@/components/AuthOverlay';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <AuthShell
      kicker="step inside"
      title="Welcome"
      titleItalic="back."
      subtitle="A small corner of the internet where the cursor still does something interesting. Sign in to keep reading."
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      loading={loading}
      error={error}
      submitLabel="Sign in"
      onSubmit={handleSubmit}
      onGoogle={() => signInWithOverlay('google', { callbackUrl: '/' })}
      onGitHub={() => signInWithOverlay('github', { callbackUrl: '/' })}
      altPrompt="New here?"
      altLinkLabel="Make an account"
      altHref="/register"
      signature="— built on weekends, mostly between espressos."
    />
  );
}
