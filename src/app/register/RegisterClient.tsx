'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { signInWithOverlay } from '@/components/AuthOverlay';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';

export default function RegisterClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign-in failed. Try logging in directly.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Registration failed.');
      setLoading(false);
    }
  };

  return (
    <AuthShell
      kicker="first time here"
      title="Welcome"
      titleItalic="in."
      subtitle="Pick a name. The email and password are the only thing we'll ask for \u2014 the rest is just reading."
      email={email}
      password={password}
      name={name}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      loading={loading}
      error={error}
      submitLabel="Create account"
      onSubmit={handleSubmit}
      onGoogle={() => signInWithOverlay('google', { callbackUrl: '/' })}
      onGitHub={() => signInWithOverlay('github', { callbackUrl: '/' })}
      altPrompt="Already have one?"
      altLinkLabel="Sign in instead"
      altHref="/login"
      signature="— no newsletter, no follow emails, no 'welcome sequence'."
    />
  );
}
