import { type ReactNode, useState, useId } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

// ── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none';
  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
  };
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
    secondary:
      'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
    ghost:
      'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'red' | 'yellow' | 'blue';
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// ── Number display ───────────────────────────────────────────────────────────

export function NumberStat({
  value,
  label,
  tone = 'neutral',
}: {
  value: ReactNode;
  label: string;
  tone?: 'neutral' | 'green' | 'red' | 'yellow' | 'blue';
}) {
  const tones = {
    neutral: 'text-slate-900 dark:text-slate-100',
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };
  return (
    <div className="flex flex-col">
      <span className={`text-2xl font-semibold tabular-nums ${tones[tone]}`}>{value}</span>
      <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

// ── Info tooltip ─────────────────────────────────────────────────────────────

export function InfoTooltip({ text, label }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
        aria-label={label || 'More information'}
        aria-describedby={open ? id : undefined}
      >
        <HelpCircle size={14} />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-[100] mb-1.5 w-60 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs leading-relaxed text-slate-600 shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {text}
        </span>
      )}
    </span>
  );
}

// ── Explanatory text ─────────────────────────────────────────────────────────

export function Explanation({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{children}</p>
  );
}

// ── Expandable section ───────────────────────────────────────────────────────

export function ExpandableSection({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">{children}</div>
      )}
    </Card>
  );
}

// ── Tone helpers ─────────────────────────────────────────────────────────────

export function toneForRemaining(remaining: number): 'green' | 'yellow' | 'red' {
  if (remaining < 0) return 'red';
  if (remaining <= 5) return 'yellow';
  return 'green';
}

export function colorForRemaining(remaining: number): string {
  if (remaining < 0) return 'text-red-600 dark:text-red-400';
  if (remaining <= 5) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}
