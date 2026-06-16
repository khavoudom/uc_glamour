'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/lib/store';
import type { UserRole } from '@/types/next-auth';

export default function StoreHydrator() {
  const { data: session } = useSession();
  const setIsAuthenticated = useStore((s) => s.setIsAuthenticated);
  const hydrate = useStore((s) => s.hydrate);
  useEffect(() => {
    setIsAuthenticated(!!session?.user, (session?.user?.role as UserRole) ?? null);
  }, [session, setIsAuthenticated]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const h = new Date().getHours();
    useStore.setState({ chatOperatingHours: h >= 9 && h < 21 });
  }, []);

  return null;
}
