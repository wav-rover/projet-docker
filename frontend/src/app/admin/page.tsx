import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import authFetch from '@/lib/auth-api';
import { getSessionToken, isAdmin, requireAdmin, type User } from '@/lib/session';
import ButtonDeleteUser from './ButtonDeleteUser';

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">Les comptes admin ne peuvent pas être supprimés depuis cette page.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <UsersTable />
      </Suspense>
    </main>
  );
}

const UsersTable = async () => {
  const currentUser = await requireAdmin();
  const users = await getUsers();

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.email}
                {user.id === currentUser.id && <span className="text-muted-foreground"> (vous)</span>}
              </TableCell>
              <TableCell>
                <Badge variant={isAdmin(user) ? 'default' : 'secondary'}>{isAdmin(user) ? 'Admin' : 'Standard'}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {!isAdmin(user) && <ButtonDeleteUser id={user.id} email={user.email} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const getUsers = async (): Promise<User[]> => {
  const response = await authFetch('/users', { headers: { Authorization: `Bearer ${await getSessionToken()}` } });

  if (!response.ok) throw new Error('Impossible de charger les comptes.');

  return response.json();
};
