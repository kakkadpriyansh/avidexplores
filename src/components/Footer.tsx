import Link from 'next/link';
import { Mountain, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo/avid Full white (1).png" alt="Avid Explorers Logo" className="h-8" />
              <img src="/logo/Avid name white.png" alt="Adventure Explorers" className="h-6" />
            </div>
            <p className="text-slate-300 text-sm">
              Your trusted partner for unforgettable adventures.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="p-2" asChild>
                <a href="https://youtube.com/@avidexplorersindia?si=lYLJZpfa_JaAl32S" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2" asChild>
                <a href="https://www.linkedin.com/company/avid-explorers/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="p-2" asChild>
                <a href="https://www.instagram.com/avidexplorers.in" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          {/* Quick Links */}
          <div className="space-y-4 lg:pl-8">
            <h3 className="font-product-sans font-semibold text-lg">Quick Links</h3>
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
                    href={link.href}
                    className="text-slate-300 :text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h3 className="font-product-sans font-semibold text-lg">Policies</h3>
            <ul className="space-y-2">
              {[
                { href: '/cancellation-policy', label: 'Cancellation & Refund' },
                { href: '/terms-and-conditions', label: 'Terms & Conditions' },
                { href: '/shipping-policy', label: 'Shipping Policy' },
                { href: '/privacy-policy', label: 'Privacy Policy' },
                { href: '/contact-us', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Adventure Categories */}
          <div className="space-y-4">
            <h3 className="font-product-sans font-semibold text-lg">Adventures</h3>
            <ul className="space-y-2">
              {[
                'Trekking',
                'Camping',
                // 'Water Sports',
                'Rock Climbing',
                'Cycling',
                'Wildlife Safari',
              ].map((category) => (
                <li key={category}>
                  <Link
                    href={`/events?category=${category.toLowerCase()}`}
                    className="text-slate-300 hover:text-orange-400 transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-product-sans font-semibold text-lg">Stay Connected</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="h-4 w-4 text-orange-400" />
                <span>info@avidexplorers.in</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="h-4 w-4 text-orange-400" />
                <span>+91 88665 52400</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>Rajkot, Gujarat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-400 text-sm">
          <p>
            Developed and designed by{' '}
            <a
              href="https://kakkadpriyanshportfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-orange-400"
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