import Link from 'next/link';
import { Suspense } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logout } from '@/lib/actions';
import { getCurrentUser, isAdmin } from '@/lib/session';

export default function HeaderSite() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Chalets Suisses
        </Link>
        <Suspense fallback={<Skeleton className="h-7 w-40" />}>
          <HeaderUser />
        </Suspense>
      </div>
    </header>
  );
}

const HeaderUser = async () => {
  const user = await getCurrentUser();

  if (!user)
    return (
      <nav className="flex items-center gap-2">
        <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Se connecter
        </Link>
        <Link href="/register" className={buttonVariants({ size: 'sm' })}>
          Créer un compte
        </Link>
      </nav>
    );

  return (
    <nav className="flex items-center gap-2">
      <Link href="/chalets" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        Chalets
      </Link>
      {isAdmin(user) && (
        <Link href="/admin" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Admin
        </Link>
      )}
      <Link href="/account" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        Mon compte
      </Link>
      <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Déconnexion
        </Button>
      </form>
    </nav>
  );
};
