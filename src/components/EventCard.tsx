'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';

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
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = event.images || (event.image ? [event.image] : ['/placeholder-event.jpg']);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-rotate and swipe handling
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const id = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [images.length, isPaused]);

  const getDifficultyColor = (difficulty: string) => {
    const normalizedDifficulty = difficulty.toLowerCase();
    switch (normalizedDifficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'difficult':
      case 'challenging':
        return 'bg-orange-100 text-orange-800';
      case 'extreme':
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-[0_20px_50px_-10px_rgba(185,28,28,0.35)] transition-all duration-500 overflow-hidden group border border-white/60 transform hover:-translate-y-2 w-full max-w-[520px] mx-auto">
      {/* Image Gallery */}
      <div
        className="relative overflow-hidden aspect-[5/3] cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => router.push(`/events/${event.slug}`)}
        onTouchStart={(e) => {
          if (e.touches && e.touches[0]) {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }
        }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0]?.clientX ?? 0;
          const endY = e.changedTouches[0]?.clientY ?? 0;
          const dx = endX - (touchStartX.current ?? 0);
          const dy = endY - (touchStartY.current ?? 0);
          // Only act on horizontal swipes
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
              setCurrentImageIndex((prev) => (prev + 1) % images.length);
            } else {
              setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
            }
          }
          touchStartX.current = null;
          touchStartY.current = null;
        }}
      >
          <img
            src={images[currentImageIndex]}
            alt={`${event.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-[0.5deg]"
          />
          {/* Vignette + glow overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.18) 100%), linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.15), transparent)'
            }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-50"
                style={{ pointerEvents: 'auto' }}
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                onClick={nextImage}
                className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-50"
                style={{ pointerEvents: 'auto' }}
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-1 z-50">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-white shadow ring-1 ring-white/70 scale-125' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    style={{ pointerEvents: 'auto' }}
                  />
                ))}
              </div>
            </>
          )}
          {/* Accent sparkles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-fuchsia-400/20 blur-3xl rounded-full group-hover:opacity-80 opacity-0 transition-opacity"></div>
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-400/20 blur-3xl rounded-full group-hover:opacity-80 opacity-0 transition-opacity"></div>

          <div className="absolute top-2 left-2">
            <Badge className={`${getDifficultyColor(event.difficulty)} font-medium px-2 py-0.5 text-xs backdrop-blur-md border border-white/30 shadow-sm`}>
              {formatDifficulty(event.difficulty)}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/70 backdrop-blur-xl text-foreground font-medium px-2 py-0.5 text-xs border border-white/60 shadow-sm">
              {event.category}
            </Badge>
          </div>
          {/* Sheen sweep */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
        </div>

        {/* Content */}
        <Link href={`/events/${event.slug}`} className="block">
          <div className="p-2.5 md:p-3">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 text-xs text-gray-600 mb-0.5">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="font-medium">
                    {typeof event.duration === 'number' 
                      ? `${event.duration}d`
                      : event.duration
                    }
                  </span>
                  <span aria-hidden className="inline-block w-px h-3 bg-gray-300" />
                  <Users className="h-3 w-3 text-primary" />
                  <span className="font-medium">{event.maxParticipants}</span>
                </div>
                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900 group-hover:text-red-700 transition-colors line-clamp-1">
                  {event.title}
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 mb-2">
              {event.shortDescription}
            </p>
          </div>

          {/* Details */}
          <div className="flex flex-col space-y-1.5 mb-2.5 text-sm md:text-base text-gray-600">
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate font-medium">
                {typeof event.location === 'string' 
                  ? event.location 
                  : `${event.location?.name || 'Location TBD'}, ${event.location?.state || ''}`
                }
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-baseline gap-2 md:gap-3">
              {event.discountedPrice && event.discountedPrice > 0 && event.discountedPrice < event.price ? (
                <span className="text-xs md:text-sm text-gray-500 line-through">₹{event.price}</span>
              ) : null}
              <span className="text-lg md:text-xl font-bold text-red-600">₹{event.discountedPrice && event.discountedPrice > 0 && event.discountedPrice < event.price ? event.discountedPrice : event.price}</span>
              <span className="text-[0.7rem] md:text-xs text-gray-500">per person</span>
            </div>
          </div>

          

          
          </div>
        </Link>
      </div>
  );
};

export default EventCard;