import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FormLogin from './FormLogin';

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Se connecter</CardTitle>
          <CardDescription>Accédez aux chalets et à vos réservations.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormLogin />
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Pas encore de compte ?&nbsp;
          <Link href="/register" className="text-foreground underline underline-offset-4">
            Créer un compte
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
