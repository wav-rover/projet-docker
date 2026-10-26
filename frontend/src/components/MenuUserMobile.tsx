'use client';

import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import type { NavLink } from '@/components/HeaderSite';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/actions';

type MenuUserMobileProps = { email: string; links: NavLink[] };

export default function MenuUserMobile({ email, links }: MenuUserMobileProps) {
  const [, startTransition] = useTransition();

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Ouvrir le menu" />}>
          <MenuIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {links.map(({ href, label }) => (
              <DropdownMenuItem key={href} render={<Link href={href} />}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => startTransition(logout)}>Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
