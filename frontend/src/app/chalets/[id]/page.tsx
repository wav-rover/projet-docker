import { ArrowLeftIcon, MapPinIcon, MountainSnowIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getChalet } from '@/lib/chalet-api';
import { formatPrice } from '@/lib/format';
import { requireUser } from '@/lib/session';
import FormBooking from './FormBooking';

export default function ChaletPage({ params }: PageProps<'/chalets/[id]'>) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <Link href="/chalets" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
        <ArrowLeftIcon aria-hidden />
        Tous les chalets
      </Link>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        {params.then(({ id }) => (
          <ChaletDetails id={id} />
        ))}
      </Suspense>
    </main>
  );
}

const ChaletDetails = async ({ id }: { id: string }) => {
  await requireUser();
  const chalet = await getChalet(id);

  if (!chalet) notFound();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Card className="pt-0">
        <div className="flex aspect-[21/9] items-center justify-center rounded-t-xl bg-muted text-muted-foreground">
          <MountainSnowIcon className="size-14" aria-hidden />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">{chalet.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPinIcon className="size-4" aria-hidden />
            {chalet.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p>{chalet.description}</p>
          <dl className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Prix par nuit</dt>
              <dd className="text-lg font-semibold">{formatPrice(chalet.pricePerNight)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Capacité</dt>
              <dd className="flex items-center gap-1 text-lg font-semibold">
                <UsersIcon className="size-4" aria-hidden />
                {chalet.capacity} personnes
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Réserver ce chalet</CardTitle>
          <CardDescription>Le prix est calculé par le service de réservation à partir du tarif du chalet.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormBooking chaletId={chalet.id} pricePerNight={chalet.pricePerNight} capacity={chalet.capacity} today={today} />
        </CardContent>
      </Card>
    </>
  );
};
