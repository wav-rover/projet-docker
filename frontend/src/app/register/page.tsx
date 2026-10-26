import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FormRegister from './FormRegister';

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>8 caractères minimum pour le mot de passe.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormRegister />
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Déjà inscrit ?&nbsp;
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Se connecter
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
