'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Mountain, LayoutDashboard, Calendar, BookOpen, Users, Menu, LogOut, PenSquare, MapPin, Image, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/stories', label: 'Stories', icon: PenSquare },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/hero', label: 'Hero Section', icon: Image },
  { href: '/admin/destination-cards', label: 'Destination Cards', icon: MapPin },
  { href: '/admin/teams', label: 'Teams', icon: Users },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const SidebarNav = () => (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 h-16 border-b">
        <Mountain className="h-6 w-6 text-primary" />
        <span className="font-montserrat font-bold text-lg">Avid Explorers Admin</span>
      </div>
      <div className="flex-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm mb-1 hover:bg-muted transition-colors',
              active ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground'
            )}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="p-3 border-t">
        <div className="text-xs text-muted-foreground mb-2 truncate">{session?.user?.email}</div>
        <Button variant="outline" className="w-full justify-start" onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
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
            <span className="font-montserrat font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarNav />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex">
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 border-r bg-card">
          <SidebarNav />
        </aside>
        <div className="flex-1 md:ml-64">
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