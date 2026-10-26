import { CalendarDaysIcon, InfoIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyBookings } from '@/lib/booking-api';
import { formatDate, formatPrice } from '@/lib/format';
import { requireUser } from '@/lib/session';
import ButtonCancelBooking from './ButtonCancelBooking';
import ButtonPayBooking from './ButtonPayBooking';

export default function BookingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Mes réservations</h1>
      <Alert>
        <InfoIcon aria-hidden />
        <AlertDescription>Le paiement est simulé : aucune donnée bancaire n&apos;est demandée et aucun montant n&apos;est débité.</AlertDescription>
      </Alert>
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        <BookingsList />
      </Suspense>
    </main>
  );
}

const BookingsList = async () => {
  await requireUser();
  const bookings = await getMyBookings();

  if (bookings.length === 0)
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-6">
        <p className="text-muted-foreground">Vous n&apos;avez pas encore de réservation.</p>
        <Link href="/chalets" className={buttonVariants({ size: 'sm' })}>
          Voir les chalets
        </Link>
      </div>
    );

  return (
    <ul className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <Card>
            <CardHeader>
              <CardTitle>
                <Link href={`/chalets/${booking.chaletId}`} className="hover:underline">
                  {booking.chaletName}
                </Link>
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden />
                  {formatDate(booking.startDate)} → {formatDate(booking.endDate)} · {booking.nights} nuit{booking.nights > 1 && 's'}
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="size-3.5 shrink-0" aria-hidden />
                  {booking.guests} pers.
                </span>
              </CardDescription>
              <CardAction>
                <Badge variant={booking.status === 'paid' ? 'default' : 'outline'}>
                  {booking.status === 'paid' ? 'Payée' : 'En attente de paiement'}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-wrap justify-between gap-2">
              <span className="font-semibold">{formatPrice(booking.totalPrice)}</span>
              <div className="flex gap-2">
                <ButtonCancelBooking id={booking.id} chaletName={booking.chaletName} />
                {booking.status === 'pending' && <ButtonPayBooking id={booking.id} />}
              </div>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
};
