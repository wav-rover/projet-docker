import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { requireUser } from '@/lib/session';

export default function ChaletsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Nos chalets</h1>
      <Suspense fallback={<Skeleton className="h-5 w-64" />}>
        <ChaletsWelcome />
      </Suspense>
    </main>
  );
}

const ChaletsWelcome = async () => {
  const user = await requireUser();

  return <p className="text-muted-foreground">Connecté en tant que {user.email}</p>;
};
