import { CheckCircle, Database, Search, ShieldCheck, Undo2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const pillars = [
  {
    title: 'Fast list-first workflow',
    description: 'The homepage centers on search, filters, sorting, and pagination so teams can find what matters without digging through menus.',
    icon: Search,
  },
  {
    title: 'Predictable record safety',
    description: 'Delete confirmation and undo give teams a forgiving workflow for day-to-day admin work without adding bulk-action complexity.',
    icon: Undo2,
  },
  {
    title: 'Persistent lightweight storage',
    description: 'RecordFlow keeps data across sessions and models CRUD through standard list/get/create/update/delete interactions.',
    icon: Database,
  },
  {
    title: 'Clean operational design',
    description: 'A bright, card-based UI makes the app approachable for product owners, operations staff, and internal admin teams.',
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">About RecordFlow</p>
        <h1 className="mt-2 text-3xl font-bold">A focused CRUD application for teams that need reliability without overhead.</h1>
        <p className="mt-4 max-w-3xl text-base text-muted-foreground">
          RecordFlow is intentionally narrow in scope: one resource type, clear validation, fast retrieval, and safe single-record operations. That focus makes it simple to maintain and quick for small teams to adopt.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Card key={pillar.title} className="border-border shadow-sm">
              <CardHeader className="p-8 pb-4">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-muted-foreground">{pillar.description}</CardContent>
            </Card>
          );
        })}
      </section>

      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">What teams can expect on day one</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            'Validated create and edit forms with consistent field patterns',
            'Read-only detail views with CSV export for individual records',
            'Search highlighting across title and description',
            'Filterable status and owner controls with sortable columns',
            'Delete confirmation and quick undo recovery',
            'Persistent local storage suited for lightweight deployment needs',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
