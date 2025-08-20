import { Link } from 'react-router-dom';
import { Mountain, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-secondary" />
              <span className="font-montserrat font-bold text-xl">
                AvidExplores
              </span>
            </div>
            <p className="text-primary-foreground/80">
              Your trusted partner for unforgettable adventures. 
              Explore the world with expert guides and fellow adventurers.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-montserrat font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/events', label: 'All Events' },
                { href: '/stories', label: 'Adventure Stories' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Adventure Categories */}
          <div className="space-y-4">
            <h3 className="font-montserrat font-semibold text-lg">Adventures</h3>
            <ul className="space-y-2">
              {[
                'Trekking',
                'Camping',
                'Water Sports',
                'Rock Climbing',
                'Cycling',
                'Wildlife Safari',
              ].map((category) => (
                <li key={category}>
                  <Link
                    to={`/events?category=${category.toLowerCase()}`}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-montserrat font-semibold text-lg">Stay Connected</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <Mail className="h-4 w-4 text-secondary" />
                <span>hello@avidexplores.com</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-foreground/80">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Mumbai, Maharashtra</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-montserrat font-medium">Newsletter</h4>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                <Button className="btn-adventure">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/60">
          <p>
            Developed and designed by{' '}
            <a
              href="https://kakkadpriyanshportfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-secondary"
            >
              Priyansh
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;