'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { login } from './actions';

export default function FormLogin() {
  const [state, action, isPending] = useActionState(login, undefined);

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending && <Spinner />}
          Se connecter
        </Button>
      </FieldGroup>
    </form>
  );
}
