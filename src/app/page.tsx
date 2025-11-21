import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import DestinationCard from '@/components/DestinationCard';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Fetch events from the database
async function getEvents() {
  try {
    // Use INTERNAL_API_URL for server-side calls to avoid DNS issues
    const base = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/events`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch events:', response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : (data.events || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Fetch destination cards from the database
async function getDestinationCards() {
  try {
    // Use INTERNAL_API_URL for server-side calls to avoid DNS issues
    const base = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/destination-cards`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch destination cards:', response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Error fetching destination cards:', error);
    return [];
  }
}

// Fetch testimonials from the database
async function getTestimonials() {
  try {
    // Use INTERNAL_API_URL for server-side calls to avoid DNS issues
    const base = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/testimonials?approved=true&limit=20`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch testimonials:', response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}






export default async function HomePage() {
  const [events, destinations, testimonials] = await Promise.all([
    getEvents(),
    getDestinationCards(),
    getTestimonials()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />

      {/* Destinations Section */}
      <section className="py-16 bg-muted/30" style={{ overflow: 'visible' }}>
        <div className="container mx-auto px-4" style={{ overflow: 'visible' }}>
          {/* Destination Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Popular Destinations</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 pt-2 px-2 -mx-2" style={{ overflowY: 'visible' }}>
              {destinations.length > 0 ? (
                destinations.map((card) => (
                  <DestinationCard 
                    key={card._id} 
                    name={card.title}
                    image={card.photo}
                    link={card.link}
                  />
                ))
              ) : (
                <div className="text-center py-8 w-full">
                  <p className="text-muted-foreground">No destination cards available at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Events Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Adventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length > 0 ? (
                events.slice(0, 6).map((event) => (
                  <EventCard key={event._id} event={event} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No events available at the moment.</p>
                </div>
              )}
            </div>
            
            {events.length > 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/events"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-product-sans font-bold text-foreground mb-4">
              Why Adventure With Us?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Safety, expertise, and unforgettable experiences are at the heart of everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-product-sans font-semibold text-foreground">
                Safety First
              </h3>
              <p className="text-muted-foreground">
                All our adventures are led by certified guides with comprehensive safety protocols
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-product-sans font-semibold text-foreground">
                Expert Guides
              </h3>
              <p className="text-muted-foreground">
                Our experienced guides know every trail and ensure you have the best experience
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-product-sans font-semibold text-foreground">
                Unforgettable Memories
              </h3>
              <p className="text-muted-foreground">
                Create lasting memories with like-minded adventurers in stunning locations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-product-sans font-bold text-foreground mb-4">
              What Our Adventurers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real experiences from real adventurers who&apos;ve explored with us
            </p>
          </div>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      <Footer />
    </div>
  );
}