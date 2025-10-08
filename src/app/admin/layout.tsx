'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Mountain, LayoutDashboard, Calendar, BookOpen, Users, Menu, LogOut, MapPin, Image, Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  // { href: '/admin/stories', label: 'Stories', icon: PenSquare }, // temporarily hidden
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/hero', label: 'Hero Section', icon: Image },
  { href: '/admin/destination-cards', label: 'Destination Cards', icon: MapPin },
  { href: '/admin/teams', label: 'Teams', icon: Users },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persist sidebar collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      if (saved !== null) setSidebarCollapsed(saved === 'true');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adminSidebarCollapsed', String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed]);

  // Handle authentication and redirect
  useEffect(() => {
    if (status === 'loading') return; // Still loading, don't redirect yet
    
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(pathname));
      return;
    }
    
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router, pathname]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render admin panel if not authenticated or not admin
  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  const SidebarNav = ({ collapsed }: { collapsed: boolean }) => (
    <nav className="flex flex-col h-full">
      <div className={cn('flex items-center gap-2 px-4 h-16 border-b', collapsed ? 'justify-center' : '')}>
        <Mountain className="h-6 w-6 text-primary" />
        {!collapsed && (
          <span className="font-product-sans font-bold text-lg">Avid Explorers Admin</span>
        )}
      </div>
      <div className="flex-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm mb-1 hover:bg-muted transition-colors',
              collapsed ? 'justify-center' : 'gap-3',
              active ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground'
            )}>
              <Icon className="h-4 w-4" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>
      <div className="p-3 border-t">
        {!collapsed && (
          <div className="text-xs text-muted-foreground mb-2 truncate">{session?.user?.email}</div>
        )}
        <Button
          variant="outline"
          size={collapsed ? 'icon' : 'default'}
          className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
          onClick={() => signOut({ callbackUrl: '/' })}
          aria-label="Sign Out"
        >
          <LogOut className={cn('h-4 w-4', collapsed ? '' : 'mr-2')} />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-primary" />
            <span className="font-product-sans font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarNav collapsed={false} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex">
        <aside className={cn('hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r bg-card', sidebarCollapsed ? 'md:w-14' : 'md:w-64')}>
          <SidebarNav collapsed={sidebarCollapsed} />
        </aside>
        <div className={cn('flex-1', sidebarCollapsed ? 'md:ml-14' : 'md:ml-64')}>
          {/* Desktop toggle bar */}
          <div className="hidden md:flex items-center h-12 px-4 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <span className="text-sm text-muted-foreground">Sidebar {sidebarCollapsed ? 'collapsed' : 'expanded'}</span>
          </div>
          {/* Top spacer for mobile header */}
          <div className="md:hidden h-2" />
          {/* Main content */}
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}