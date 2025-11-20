'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const allNavItems = [
  { href: '/admin/admin-dashboard', permission: 'admin_only' },
  { href: '/admin/events', permission: 'events' },
  { href: '/admin/bookings', permission: 'bookings' },
  { href: '/admin/inquiries', permission: 'inquiries' },
  { href: '/admin/testimonials', permission: 'testimonials' },
  { href: '/admin/hero', permission: 'hero' },
  { href: '/admin/destination-cards', permission: 'destinations' },
  { href: '/admin/teams', permission: 'teams' },
];

export default function AdminRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.replace('/login?callbackUrl=/admin');
      return;
    }

    if (session.user.role === 'ADMIN') {
      router.replace('/admin/admin-dashboard');
    } else if (session.user.role === 'SUB_ADMIN') {
      const userPermissions = (session.user as any).permissions || [];
      const firstAllowed = allNavItems.find(item => 
        item.permission !== 'admin_only' && userPermissions.includes(item.permission)
      );
      if (firstAllowed) {
        router.replace(firstAllowed.href);
      } else {
        router.replace('/dashboard');
      }
    } else {
      router.replace('/dashboard');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
