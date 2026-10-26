import { MapPinIcon, MountainSnowIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getChalets } from '@/lib/chalet-api';
import { formatPrice } from '@/lib/format';
import { requireUser } from '@/lib/session';

export default function ChaletsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Nos chalets</h1>
        <p className="text-muted-foreground">Des chalets sélectionnés dans les Alpes suisses.</p>
      </div>
      <Suspense fallback={<ChaletsGridSkeleton />}>
        <ChaletsGrid />
      </Suspense>
    </main>
  );
}

const ChaletsGrid = async () => {
  await requireUser();
  const chalets = await getChalets();

  if (chalets.length === 0) return <p className="text-muted-foreground">Aucun chalet disponible pour le moment.</p>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {chalets.map((chalet) => (
        <li key={chalet.id}>
          <Link href={`/chalets/${chalet.id}`} className="group block h-full rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <Card className="h-full pt-0 transition-shadow group-hover:shadow-md">
              <div className="flex aspect-[16/9] items-center justify-center rounded-t-xl bg-muted text-muted-foreground">
                <MountainSnowIcon className="size-10" aria-hidden />
              </div>
              <CardHeader>
                <CardTitle>{chalet.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPinIcon className="size-3.5" aria-hidden />
                  {chalet.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground">{chalet.description}</CardContent>
              <CardFooter className="justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <UsersIcon className="size-3.5" aria-hidden />
                  {chalet.capacity} pers.
                </span>
                <span>
                  <span className="font-semibold">{formatPrice(chalet.pricePerNight)}</span>
                  <span className="text-muted-foreground"> / nuit</span>
                </span>
              </CardFooter>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const ChaletsGridSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((key) => (
      <Skeleton key={key} className="h-80 rounded-xl" />
    ))}
  </div>
);
