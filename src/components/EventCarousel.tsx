'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventCard from './EventCard';
import { useRef } from 'react';

interface Event {
  _id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  discountedPrice?: number;
  location: string | {
    name: string;
    state: string;
    country: string;
  };
  region?: string;
  difficulty: string;
  duration: number | string;
  images?: string[];
  image?: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  maxParticipants: number;
  tags: string[];
}

interface EventCarouselProps {
  events: Event[];
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const EventCarousel = ({ events, title, icon: Icon }: EventCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-16">
      {/* Region Header */}
      <div className="mb-6 pb-4 border-b-2 border-primary/20">
        <div className="flex items-center gap-4">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          <h2 className="text-xl font-montserrat font-bold text-foreground">
            {title}
          </h2>
        </div>
        <p className="text-lg text-muted-foreground ml-12">
          {events.length} adventure{events.length !== 1 ? 's' : ''} available
        </p>
      </div>
      
      {/* Carousel */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {events.map((event) => (
          <div key={event._id} className="flex-shrink-0 w-80">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;