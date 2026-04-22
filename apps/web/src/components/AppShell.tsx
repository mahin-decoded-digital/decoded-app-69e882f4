import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Database, Moon, Plus, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const links = [
  { to: '/', label: 'Records' },
  { to: '/records/new', label: 'Create' },
  { to: '/about', label: 'About' },
];

export const AppShell = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">RecordFlow</p>
              <p className="text-sm text-muted-foreground">Reliable records for fast-moving teams</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 rounded-full border border-border bg-card p-1 shadow-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                  )
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <NavLink to="/records/new">
                <Plus className="mr-2 h-4 w-4" />
                New record
              </NavLink>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        {location.pathname === '/' && (
          <section className="rounded-3xl border border-border bg-card px-8 py-10 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">List-first admin workspace</p>
                <h1 className="text-4xl font-bold tracking-tight">Manage records with speed, clarity, and safe recovery.</h1>
                <p className="text-base text-muted-foreground">
                  Search instantly, filter by status or owner, open full details, and handle edits or deletes with confidence.
                </p>
              </div>
              <div className="grid gap-4 rounded-2xl border border-border bg-background p-6 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Instant search</p>
                    <p className="text-sm text-muted-foreground">Across title and description with highlights.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Persistent storage</p>
                    <p className="text-sm text-muted-foreground">Data stays available between sessions.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        <Outlet />
      </main>
    </div>
  );
};