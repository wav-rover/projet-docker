'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { createChalet } from './actions';

export default function FormChalet() {
  const [state, action, isPending] = useActionState(createChalet, undefined);

  return (
    <form action={action}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="name">Nom</FieldLabel>
            <Input id="name" name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="location">Lieu</FieldLabel>
            <Input id="location" name="location" placeholder="Zermatt, Valais" required />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" name="description" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="pricePerNight">Prix par nuit (CHF)</FieldLabel>
            <Input id="pricePerNight" name="pricePerNight" type="number" min={1} step={1} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="capacity">Capacité</FieldLabel>
            <Input id="capacity" name="capacity" type="number" min={1} step={1} required />
          </Field>
        </div>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={isPending} className="sm:self-start">
          {isPending && <Spinner />}
          Ajouter le chalet
        </Button>
      </FieldGroup>
    </form>
  );
}
