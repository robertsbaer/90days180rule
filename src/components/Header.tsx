import { Moon, Sun, Undo2, Redo2 } from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { NavLink } from 'react-router-dom';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s.past.length > 0);
  const canRedo = useStore((s) => s.future.length > 0);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <NavLink to="/" className="leading-tight">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Schengen Calculator
            </h1>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              90/180-day rule
            </p>
          </NavLink>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          <NavLink to="/schengen-calculator" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Calculator</NavLink>
          <NavLink to="/90-180-rule" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">90/180 Rule</NavLink>
          <NavLink to="/faq" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">FAQ</NavLink>
          <NavLink to="/travel-tips" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">Travel Tips</NavLink>
        </nav>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Redo"
          >
            <Redo2 size={16} />
          </button>
          <div className="mx-1.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={toggleTheme}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 px-4 py-6 sm:px-6 dark:border-slate-800">
      <div className="mx-auto max-w-3xl space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          For planning only. Border officials make the final determination. Always verify against
          the official European Commission calculator.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Made by{' '}
          <a
            href="https://dcmademedia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
          >
            DC Made Media
          </a>
        </p>
      </div>
    </footer>
  );
}
