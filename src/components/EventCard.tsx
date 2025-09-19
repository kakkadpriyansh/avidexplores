'use client';

import Link from 'next/link';
import { MapPin, Clock, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Flexible Event interface that handles both mock data and database data
interface FlexibleEvent {
  _id?: string;
  id?: string;
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

interface EventCardProps {
  event: FlexibleEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = event.images || (event.image ? [event.image] : ['/placeholder-event.jpg']);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getDifficultyColor = (difficulty: string) => {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'difficult':
      case 'challenging':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'extreme':
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  };

  return (
    <Link href={`/events/${event.slug}`} className="block">
      <div className="card-adventure group cursor-pointer hover:shadow-lg transition-shadow">
        {/* Image Gallery */}
        <div className="relative overflow-hidden h-48">
          <img
            src={images[currentImageIndex]}
            alt={`${event.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4">
            <Badge className={getDifficultyColor(event.difficulty)}>
              {formatDifficulty(event.difficulty)}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-background/90 text-foreground">
              {event.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-montserrat font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {event.shortDescription}
          </p>

          {/* Details */}
          <div className="flex flex-col space-y-2 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                {typeof event.location === 'string' 
                  ? event.location 
                  : `${event.location?.name || 'Location TBD'}, ${event.location?.state || ''}`
                }
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {typeof event.duration === 'number' 
                  ? `${event.duration} ${event.duration === 1 ? 'day' : 'days'}`
                  : event.duration
                }
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Up to {event.maxParticipants} participants</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            )) || null}
          </div>

          {/* Price Section */}
          <div className="flex items-center">
            <div>
              {event.discountedPrice && event.discountedPrice > 0 && event.discountedPrice < event.price ? (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{event.discountedPrice}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                      ₹{event.price}
                    </span>
                    <span className="text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full font-medium">
                      DISCOUNTED
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    per person
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{event.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    per person
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;