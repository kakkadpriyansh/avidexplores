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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1">
        {/* Image Gallery */}
        <div className="relative overflow-hidden h-44">
          <img
            src={images[currentImageIndex]}
            alt={`${event.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-2 left-2">
            <Badge className={`${getDifficultyColor(event.difficulty)} font-medium px-2 py-0.5 text-xs`}>
              {formatDifficulty(event.difficulty)}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/90 text-foreground font-medium px-2 py-0.5 text-xs">
              {event.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
              {event.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
              {event.shortDescription}
            </p>
          </div>

          {/* Details */}
          <div className="flex flex-col space-y-1.5 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate">
                {typeof event.location === 'string' 
                  ? event.location 
                  : `${event.location?.name || 'Location TBD'}, ${event.location?.state || ''}`
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Clock className="h-3 w-3 text-primary" />
                <span>
                  {typeof event.duration === 'number' 
                    ? `${event.duration}d`
                    : event.duration
                  }
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="h-3 w-3 text-primary" />
                <span>{event.maxParticipants}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {event.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                {tag}
              </Badge>
            )) || null}
          </div>

          {/* Price Section */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div>
              {event.discountedPrice && event.discountedPrice > 0 && event.discountedPrice < event.price ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    ₹{event.price}
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₹{event.discountedPrice}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{event.price}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400 text-xs block">
                per person
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;