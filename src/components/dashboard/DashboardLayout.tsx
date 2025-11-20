'use client';

import { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { DashboardNav, DashboardMobileNav } from './DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LogOut, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-product-sans font-bold">Dashboard</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {sidebarOpen && (
          <div className="p-4 border-b bg-muted/50 space-y-4">
            <DashboardMobileNav />
            
            {/* Mobile Sign Out */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-5 lg:gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-0 h-screen p-6">
            <div className="space-y-6">
              {/* User Profile */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div>
                <DashboardNav />
              </div>

              <Separator />

              {/* Sign Out */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          <div className="p-4 lg:p-6">
            {/* Header */}
            {(title || description) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl lg:text-3xl font-product-sans font-bold text-foreground mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Page Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick search component for dashboard pages
export function DashboardSearch({ 
  placeholder = "Search...", 
  onSearch 
}: { 
  placeholder?: string;
  onSearch?: (query: string) => void;
}) {
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}