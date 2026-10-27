import { CalendarCheckIcon, MountainSnowIcon, UserRoundIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentUser } from '@/lib/session';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b bg-muted/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-4 py-20 sm:py-28">
          <Badge variant="outline">Valais · Berne · Grisons</Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Votre chalet dans les Alpes suisses
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            De Zermatt à Davos, des chalets sélectionnés pour vos séjours à la montagne, l&apos;hiver comme l&apos;été.
          </p>
          <Suspense fallback={<Skeleton className="h-20 w-full max-w-sm" />}>
            <HomeCallToAction />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3">
        {FEATURES.map(({ Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-2">
            <Icon className="size-5 text-muted-foreground" aria-hidden />
            <h2 className="font-medium">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

const HomeCallToAction = async () => {
  const user = await getCurrentUser();

  if (user)
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Connecté en tant que {user.email}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/chalets" className={buttonVariants({ size: 'lg' })}>
            Voir les chalets
          </Link>
          <Link href="/bookings" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Mes réservations
          </Link>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Connectez-vous pour voir les chalets et réserver votre séjour.</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/login" className={buttonVariants({ size: 'lg' })}>
          Se connecter
        </Link>
        <Link href="/register" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
          Créer un compte
        </Link>
      </div>
    </div>
  );
};

const FEATURES = [
  {
    Icon: MountainSnowIcon,
    title: 'Chalets sélectionnés',
    description: "Des chalets en Valais, dans l'Oberland bernois et aux Grisons, du refuge authentique au grand chalet familial.",
  },
  {
    Icon: CalendarCheckIcon,
    title: 'Réservation en ligne',
    description: 'Choisissez vos dates et le nombre de voyageurs : le prix du séjour est calculé immédiatement.',
  },
  {
    Icon: UserRoundIcon,
    title: 'Votre espace personnel',
    description: 'Retrouvez vos réservations, réglez vos séjours et gérez votre compte à tout moment.',
  },
];
