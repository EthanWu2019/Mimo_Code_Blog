'use client';

/**
 * AuthShell — visual + interaction layer for /login and /register.
 *
 * Visual design philosophy (owner direction):
 *   - Strict black/white. No accent colors.
 *   - Editorial typography (a display serif headline + a small
 *     uppercase-tracked kicker) instead of the default "Welcome back /
 *     Sign in to your account" stack.
 *   - Three small "smile" details:
 *       1. The headline italicizes ONE word — the one that lands.
 *       2. The submit button label slides left on hover; the arrow
 *          icon flies in from the right and lands at the label's end.
 *       3. Below the form: a tiny handwritten-feeling caption that
 *          hints at the site's tone.
 *
 * This component renders ONLY the chrome (form, buttons, headline).
 * Auth submit logic stays in the page that uses it — we expose an
 * `onSubmit` callback for credentials, and pass-through props for
 * OAuth button handlers. Same as before: no business logic moved.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// A small reusable input with floating label + ink-underline focus
// animation. The underline draws in from the left when the input
// receives focus or holds a value.
function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required,
  minLength,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  const focused = value.length > 0;
  return (
    <div className="relative pt-5 group">
      {/* Static label that floats up when focused or filled. */}
      <label
        htmlFor={id}
        className={`absolute left-0 pointer-events-none transition-all duration-300 ease-out ${
          focused
            ? 'top-0 text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400'
            : 'top-7 text-base text-zinc-400 dark:text-zinc-500'
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        placeholder={focused ? placeholder : ''}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-0 border-b border-zinc-200 dark:border-zinc-800 pb-2 pt-1 text-base text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-none focus:ring-0 transition-colors"
      />
      {/* Animated underline — grows from left to right when focused. */}
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-px bg-zinc-900 dark:bg-white transition-transform duration-500 ease-out origin-left ${
          focused ? 'scale-x-100' : 'scale-x-0'
        } w-full`}
      />
    </div>
  );
}

// Primary submit button with the "label slides left, arrow flies in"
// hover micro-interaction. The button itself is a clean black/white
// pill — restrained, but the motion gives it personality.
function SubmitButton({
  loading,
  children,
  type = 'submit',
  disabled,
}: {
  loading: boolean;
  children: ReactNode;
  type?: 'submit' | 'button';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="group relative w-full h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium tracking-tight overflow-hidden disabled:opacity-50 transition-all duration-300"
    >
      <span className="relative h-full w-full flex items-center justify-center">
        {/* Label container slides left on hover. */}
        <motion.span
          className="inline-flex items-center"
          initial={false}
          animate={loading ? { x: -16, opacity: 0 } : { x: 0, opacity: 1 }}
          whileHover={{ x: -16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          {loading ? '…' : children}
        </motion.span>
        {/* Arrow that flies in from the right and lands at the label's
            tail. Positioned absolutely so it sits in the same spot the
            label used to occupy, no layout shift. */}
        <motion.span
          aria-hidden
          className="absolute inset-y-0 flex items-center"
          initial={false}
          animate={loading ? { x: 80, opacity: 0 } : { x: 80, opacity: 0 }}
          whileHover={{ x: 36, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </motion.span>
      </span>
    </button>
  );
}

// OAuth row — Google + GitHub. Same width as SubmitButton so the form
// reads as a single column. Icon sits inside a small square that fills
// on hover; the icon stays the same color (brand SVG keeps its colors).
function OAuthButton({
  provider,
  onClick,
  icon,
  label,
}: {
  provider: 'google' | 'github';
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full h-12 rounded-full bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm font-medium tracking-tight overflow-hidden hover:border-zinc-900 dark:hover:border-white transition-colors duration-300 flex items-center justify-center"
    >
      {/* The icon container \u2014 a small chip that fills with the brand
          color on hover, behind the icon. Positioned absolutely so the
          icon stays centered regardless of chip size. */}
      <span
        aria-hidden
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
          provider === 'google'
            ? 'group-hover:bg-white group-hover:shadow-[0_0_0_4px_rgba(255,255,255,0.4)]'
            : 'group-hover:bg-zinc-900 group-hover:shadow-[0_0_0_4px_rgba(0,0,0,0.4)] dark:group-hover:bg-white dark:group-hover:shadow-[0_0_0_4px_rgba(255,255,255,0.4)]'
        }`}
      >
        {icon}
      </span>
      <span className="ml-6">{label}</span>
    </button>
  );
}

export interface AuthShellProps {
  // Top-of-card editorial copy. `kicker` is the small uppercase label.
  // `titleItalic` is the word that gets the italic emphasis — usually
  // the verb. `subtitle` is the soft whisper below the title.
  kicker: string;
  title: string;
  titleItalic: string;
  subtitle: string;
  // Form state. Caller owns all of these.
  email: string;
  password: string;
  name?: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onNameChange?: (v: string) => void;
  // Submit
  loading: boolean;
  error: string;
  // Display label on the primary submit
  submitLabel: string;
  onSubmit: (e: React.FormEvent) => void;
  // OAuth
  onGoogle: () => void;
  onGitHub: () => void;
  // Footer link
  altPrompt: string;
  altLinkLabel: string;
  altHref: string;
  // The "smile" detail line at the bottom
  signature: string;
}

export function AuthShell(props: AuthShellProps) {
  const {
    kicker,
    title,
    titleItalic,
    subtitle,
    email,
    password,
    name,
    onEmailChange,
    onPasswordChange,
    onNameChange,
    loading,
    error,
    submitLabel,
    onSubmit,
    onGoogle,
    onGitHub,
    altPrompt,
    altLinkLabel,
    altHref,
    signature,
  } = props;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Monogram + kicker. The monogram is rendered as display
            serif type (system fallback to Times New Roman) so it has
            weight without needing a custom font. */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-zinc-900 dark:text-white font-serif italic text-2xl leading-none">E/W</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 font-medium">
            {kicker}
          </span>
        </div>

        {/* Big editorial headline. Split into spans so we can
            italicize one word \u2014 a small smile, but reads as confident. */}
        <h1 className="font-serif text-[34px] sm:text-[38px] leading-[1.05] tracking-[-0.02em] text-zinc-900 dark:text-white">
          {title}{' '}
          <span className="italic font-serif">{titleItalic}</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {subtitle}
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {onNameChange && (
            <FloatingInput
              id="name"
              label="What should we call you?"
              value={name ?? ''}
              onChange={(e) => onNameChange(e.target.value)}
              autoComplete="name"
              placeholder="Chengze Wu"
            />
          )}
          <FloatingInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@ethanwu.work"
          />
          <FloatingInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            minLength={6}
            autoComplete={name !== undefined ? 'new-password' : 'current-password'}
            placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
          />

          {/* Error appears in-place below the password field, with a
              subtle slide-in. */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-xs text-red-600 dark:text-red-400 -mt-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2">
            <SubmitButton loading={loading}>{submitLabel}</SubmitButton>
          </div>
        </form>

        {/* Or-with-line divider */}
        <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
          <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span>or</span>
          <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* OAuth */}
        <div className="mt-4 space-y-2.5">
          <OAuthButton
            provider="google"
            onClick={onGoogle}
            label="Continue with Google"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.3l8 6.2C12.3 13.3 17.7 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4 6.9-9.9 6.9-17.6z" />
                <path fill="#FBBC05" d="M10.5 28.5c-.6-1.8-1-3.7-1-5.7s.4-3.9 1-5.7l-8-6.2C.9 14.4 0 18.1 0 22c0 3.9.9 7.6 2.5 10.9l8-6.4z" />
                <path fill="#34A853" d="M24 46c6.2 0 11.4-2 15.2-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.6 2.3-6.3 0-11.7-3.8-13.5-9.4l-8 6.2C6.4 42.6 14.6 46 24 46z" />
              </svg>
            }
          />
          <OAuthButton
            provider="github"
            onClick={onGitHub}
            label="Continue with GitHub"
            icon={
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4C16.4 4.7 17.4 5 17.4 5c.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9 0-6.3-5.2-11.5-11.5-11.5z" />
              </svg>
            }
          />
        </div>

        {/* Alt link + signature */}
        <div className="mt-6 text-center space-y-1.5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {altPrompt}{' '}
            <a
              href={altHref}
              className="text-zinc-900 dark:text-white font-medium underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-900 dark:hover:decoration-white transition-colors"
            >
              {altLinkLabel}
            </a>
          </p>
          {/* The "smile" detail \u2014 a tiny italic line that hints at the
              site's tone without trying too hard. */}
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-serif italic">
            {signature}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Export sub-components in case the page wants to compose them
// differently (e.g. add extra fields).
export { FloatingInput, SubmitButton, OAuthButton };
