import { Link, useLocation } from 'react-router-dom';
import { Menu, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const Navigation = () => {
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/stories', label: 'Stories' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Mountain className="h-8 w-8 text-primary group-hover:text-primary-glow transition-colors" />
            <span className="font-montserrat font-bold text-xl text-foreground">
              AvidExplores
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-inter font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="btn-outline">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="btn-adventure">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        to={link.href}
                        className={`text-lg font-inter font-medium transition-colors hover:text-primary ${
                          isActive(link.href) ? 'text-primary' : 'text-foreground/80'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  
                  <div className="flex flex-col space-y-4 pt-6 border-t border-border/50">
                    <SheetClose asChild>
                      <Link to="/login">
                        <Button variant="outline" className="w-full btn-outline">
                          Login
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/register">
                        <Button className="w-full btn-adventure">
                          Sign Up
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;