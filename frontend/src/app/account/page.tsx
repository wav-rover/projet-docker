import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { requireUser } from '@/lib/session';
import ButtonDeleteAccount from './ButtonDeleteAccount';

export default function AccountPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Mon compte</h1>
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
        <AccountDetails />
      </Suspense>
    </main>
  );
}

const AccountDetails = async () => {
  const user = await requireUser();
  const isAdmin = user.roles.includes('ROLE_ADMIN');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{user.email}</CardTitle>
          <CardDescription>
            <Badge variant={isAdmin ? 'default' : 'secondary'}>{isAdmin ? 'Admin' : 'Standard'}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Supprimer le compte</CardTitle>
          <CardDescription>Votre compte et toutes vos sessions seront définitivement supprimés.</CardDescription>
        </CardHeader>
        <CardFooter>
          <ButtonDeleteAccount />
        </CardFooter>
      </Card>
    </>
  );
};
