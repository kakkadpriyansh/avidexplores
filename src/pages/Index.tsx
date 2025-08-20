import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import TestimonialCard from '@/components/TestimonialCard';
import StoryCard from '@/components/StoryCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { mockEvents, mockTestimonials, mockStories } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />

      {/* Featured Events Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Featured Adventures
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular adventures, carefully curated for every type of explorer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/events">
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
            {mockTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-foreground mb-4">
              Adventure Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get inspired by tales of adventure, discovery, and personal growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/stories">
              <Button variant="outline" className="btn-outline group">
                Read More Stories
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
