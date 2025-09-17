import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import DestinationCard from '@/components/DestinationCard';
import TestimonialCard from '@/components/TestimonialCard';
import StoryCard from '@/components/StoryCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, Shield } from 'lucide-react';

// Fetch events from the database
async function getEvents() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/testimonials?featured=true&limit=6`, {
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

// Fetch stories from the database
async function getStories() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/stories?limit=10&sortBy=publishedAt&sortOrder=desc`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch stories:', response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

export default async function HomePage() {
  const events = await getEvents();
  const destinationCards = await getDestinationCards();
  const testimonials = await getTestimonials();
  const stories = await getStories();
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />

      {/* Destinations Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Destination Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Popular Destinations</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {destinationCards.length > 0 ? (
                destinationCards.map((card) => (
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

          {/* Featured Events */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Adventures</h2>
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
          </div>

          <div className="text-center">
            <Link href="/events">
              <Button className="btn-hero group">
                View All Adventures
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
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
              <h3 className="text-xl font-montserrat font-semibold text-foreground">
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
              <h3 className="text-xl font-montserrat font-semibold text-foreground">
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
              <h3 className="text-xl font-montserrat font-semibold text-foreground">
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
      <section className="py-16 bg-gradient-mountain">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white mb-4">
              What Our Adventurers Say
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Real experiences from real adventurers who've explored with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial._id} testimonial={testimonial} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-white/80">No testimonials available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Adventure Stories
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Real stories from real adventurers. Get inspired by their journeys and start planning your own.
              </p>
          </div>
          
          {/* Featured Story */}
            {stories.length > 0 && (
              <div className="mb-16">
                <div className="bg-card rounded-2xl shadow-xl overflow-hidden border">
                  <div className="lg:flex">
                    <div className="lg:w-1/2">
                      <img
                        src={stories[0].coverImage}
                        alt={stories[0].title}
                        className="w-full h-64 lg:h-full object-cover"
                      />
                    </div>
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center mb-4">
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                          Featured Story
                        </span>
                        <span className="ml-3 text-sm text-muted-foreground">
                          {stories[0].readTime || 5} min read
                        </span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                        {stories[0].title}
                      </h3>
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        {stories[0].excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={stories[0].userId?.avatar || '/placeholder.svg'}
                            alt={stories[0].userId?.name || 'Author'}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-semibold text-foreground">{stories[0].userId?.name || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(stories[0].publishedAt || stories[0].createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/stories/${stories[0].slug}`}
                          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200"
                        >
                          Read Story
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          
          {/* More Stories Grid */}
           {stories.length > 1 && (
             <div className="mb-12">
               <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
                 More Adventures
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {stories.slice(1).map((story) => (
                   <StoryCard key={story._id} story={story} />
                 ))}
               </div>
             </div>
           )}
           
           {/* No Stories Message */}
           {stories.length === 0 && (
             <div className="text-center py-16">
               <div className="max-w-md mx-auto">
                 <div className="text-muted-foreground mb-4">
                   <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                 </div>
                 <h3 className="text-xl font-semibold text-foreground mb-2">No stories found</h3>
                 <p className="text-muted-foreground">Check back later for new adventure stories from our community.</p>
               </div>
             </div>
           )}
          
          <div className="text-center">
            <Link
              href="/stories"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200"
            >
              Read More Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}