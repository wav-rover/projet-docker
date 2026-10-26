'use client';

import { CreditCardIcon } from 'lucide-react';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { payBooking } from './actions';

export default function ButtonPayBooking({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button size="sm" disabled={isPending} onClick={() => startTransition(() => payBooking(id))}>
      {isPending ? <Spinner /> : <CreditCardIcon aria-hidden />}
      Payer (simulation)
    </Button>
  );
}
