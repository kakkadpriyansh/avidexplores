import { Link } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adventureStats } from '@/data/mockData';
import heroImage from '@/assets/hero-adventure.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Adventure landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-montserrat font-bold text-white mb-6 fade-in-up">
            Discover Your Next
            <span className="block text-transparent bg-gradient-sunset bg-clip-text">
              Adventure
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto fade-in-up">
            From challenging mountain treks to peaceful camping escapes, 
            embark on unforgettable journeys with expert guides and fellow adventurers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in-up">
            <Link to="/events">
              <Button className="btn-hero group">
                Explore Adventures
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/stories">
              <Button variant="outline" className="btn-outline">
                Read Stories
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto stagger-children">
            <div className="glass-card p-6 rounded-2xl text-center">
              <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-montserrat font-bold text-white">
                {adventureStats.participants}
              </div>
              <div className="text-white/80 text-sm">Happy Adventurers</div>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <Award className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-montserrat font-bold text-white">
                {adventureStats.guides}
              </div>
              <div className="text-white/80 text-sm">Expert Guides</div>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <MapPin className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-montserrat font-bold text-white">
                {adventureStats.events}
              </div>
              <div className="text-white/80 text-sm">Adventures</div>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <Calendar className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-montserrat font-bold text-white">
                {adventureStats.years}
              </div>
              <div className="text-white/80 text-sm">Years Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;