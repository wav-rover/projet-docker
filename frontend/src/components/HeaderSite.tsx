import { UserRoundIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import MenuUserMobile from '@/components/MenuUserMobile';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logout } from '@/lib/actions';
import { getCurrentUser, isAdmin } from '@/lib/session';

export type NavLink = { href: string; label: string };

export default function HeaderSite() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight whitespace-nowrap">
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

  const links = getNavLinks(isAdmin(user));

  return (
    <>
      <nav className="hidden items-center gap-2 md:flex">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            {label}
          </Link>
        ))}
        <Link
          href="/account"
          title="Mon compte"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'max-w-56 text-muted-foreground' })}
        >
          <UserRoundIcon aria-hidden />
          <span className="truncate">{user.email}</span>
        </Link>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Déconnexion
          </Button>
        </form>
      </nav>
      <MenuUserMobile email={user.email} links={links} />
    </>
  );
};

const getNavLinks = (isAdminUser: boolean): NavLink[] => [
  { href: '/chalets', label: 'Chalets' },
  { href: '/bookings', label: 'Mes réservations' },
  ...(isAdminUser ? [{ href: '/admin', label: 'Admin' }] : []),
];
