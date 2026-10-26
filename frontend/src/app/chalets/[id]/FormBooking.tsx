'use client';

import { useActionState, useState } from 'react';
import { createBooking } from '@/app/bookings/actions';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { countNights, formatPrice } from '@/lib/format';

type FormBookingProps = { chaletId: number; pricePerNight: number; capacity: number; today: string };

export default function FormBooking({ chaletId, pricePerNight, capacity, today }: FormBookingProps) {
  const [state, action, isPending] = useActionState(createBooking, undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const nights = startDate !== '' && endDate !== '' ? countNights(startDate, endDate) : 0;

  return (
    <form action={action}>
      <input type="hidden" name="chaletId" value={chaletId} />
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="startDate">Arrivée</FieldLabel>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              min={today}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="endDate">Départ</FieldLabel>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              min={startDate !== '' ? startDate : today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="guests">Personnes</FieldLabel>
            <Input id="guests" name="guests" type="number" min={1} max={capacity} defaultValue={Math.min(2, capacity)} required />
          </Field>
        </div>
        {nights > 0 && (
          <p className="text-sm text-muted-foreground">
            {nights} nuit{nights > 1 && 's'} × {formatPrice(pricePerNight)} ={' '}
            <span className="font-semibold text-foreground">{formatPrice(nights * pricePerNight)}</span>
          </p>
        )}
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" size="lg" disabled={isPending} className="sm:self-start">
          {isPending && <Spinner />}
          Réserver
        </Button>
      </FieldGroup>
    </form>
  );
}
