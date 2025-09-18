import Link from 'next/link';
import { ArrowRight, Users, MapPin, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adventureStats } from '@/data/mockData';
// Using direct path to image in assets folder

const Hero = () => {
  return (
    <section className="relative min-h-[60vh] sm:h-[50vh] flex flex-col items-center justify-center overflow-hidden pt-16 pb-8">
      {/* Background Image */}
      <img
        src="/hero-adventure.jpg"
        alt="Adventure landscape"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <span className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/50 z-0" />

      {/* Main Heading */}
      <h1 className="relative z-10 text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-montserrat font-bold text-white mb-4 sm:mb-6 mt-8 sm:mt-12 md:mt-16 fade-in-up text-center px-4 leading-tight">
        <span className="block">Discover Your Next</span>
        <span className="block text-transparent bg-gradient-sunset bg-clip-text">
          Adventure
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-sm sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto fade-in-up text-center px-4 leading-relaxed">
        From challenging mountain treks to peaceful camping escapes, 
        embark on unforgettable journeys with expert guides and fellow adventurers.
      </p>

      {/* CTA Buttons */}
      <nav className="relative z-10 flex flex-col sm:flex-row gap-4 items-center justify-center mb-16 fade-in-up">
        <Link href="/events">
          <Button className="btn-hero group w-full sm:w-auto">
            Explore Adventures
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/stories">
          <Button variant="outline" className="btn-outline w-full sm:w-auto">
            Read Stories
          </Button>
        </Link>
      </nav>


    </section>
  );
};

export default Hero;