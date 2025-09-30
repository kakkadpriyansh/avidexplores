'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft, 
  Share2, 
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Backpack,
  Shield,
  Heart,
  Mountain,
  Flag,
  Sunrise,
  Camera,
  Plane,
  ChevronDown,
  ChevronUp,
  Compass,
  Utensils
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingRing } from '@/components/ui/loading-ring';

// Database Event interface
interface DatabaseEvent {
  _id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  discountedPrice?: number;
  location: {
    name: string;
    state: string;
    country: string;
  };
  difficulty: string;
  duration: number;
  images: string[];
  description: string;
  shortDescription: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  maxParticipants: number;
  tags: string[];
  itinerary: Array<{
    day: number;
    title: string;
    location?: string;
    description: string;
    activities?: string[];
    meals?: string[];
    accommodation?: string;
    images?: string[];
  }>;
  preparation: {
    physicalRequirements: string;
    medicalRequirements: string;
    experienceLevel: string;
    safetyGuidelines: string[];
    additionalNotes: string;
  };
  availableDates?: {
    month: string;
    year: number;
    dates: number[];
    location?: string;
    availableSeats?: number;
    totalSeats?: number;
  }[];
  availableMonths?: string[];
  thingsToCarry: string[];
  ageLimit: {
    min: number;
    max: number;
  };
  season: string[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [event, setEvent] = useState<DatabaseEvent | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<DatabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const carouselApiRef = useRef<any>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch the specific event and related events in parallel
        const [eventResponse, eventsResponse] = await Promise.allSettled([
          fetch(`/api/events/${slug}`),
          fetch('/api/events?limit=10') // Limit to reduce payload
        ]);

        // Handle main event response
        if (eventResponse.status === 'fulfilled' && eventResponse.value.ok) {
          const eventData = await eventResponse.value.json();
          setEvent(eventData.data);
          setLoading(false); // Show main content immediately
        } else {
          console.error('Failed to fetch event');
          router.push('/events');
          return;
        }

        // Handle related events response (non-blocking)
        if (eventsResponse.status === 'fulfilled' && eventsResponse.value.ok) {
          const eventsData = await eventsResponse.value.json();
          const allEvents = eventsData.events || [];
          const related = allEvents.filter((e: DatabaseEvent) => e.slug !== slug).slice(0, 3);
          setRelatedEvents(related);
        }
        setRelatedLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        router.push('/events');
      }
    };

    fetchEventData();
  }, [slug, router]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Sync carousel with currentImageIndex state
  useEffect(() => {
    if (carouselApiRef.current) {
      carouselApiRef.current.scrollTo(currentImageIndex);
    }
  }, [currentImageIndex]);

  // Auto-play functionality
  useEffect(() => {
    if (!event || !event.images || event.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === event.images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [event?.images]);

  // Compute itinerary helpers
  const hasDeparture = event?.itinerary?.some((d) => d.day === 0) ?? false;
  const totalDays = event ? Math.max(...event.itinerary.map((d) => d.day)) : 0;

  const toggleDayExpansion = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber);
    } else {
      newExpanded.add(dayNumber);
    }
    setExpandedDays(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoadingRing size="lg" />
            <p className="text-lg text-muted-foreground">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist.</p>
            <Link href="/events">
              <Button>Browse All Events</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Adventure link has been copied to clipboard.",
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'inclusions', label: 'What\'s Included' },
    { id: 'preparation', label: 'Preparation' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Event Header */}
      <article className="pt-24">
        {/* Image Gallery */}
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden">
          {event.images && event.images.length > 0 ? (
            <Carousel 
              className="w-full h-full"
              setApi={(api) => {
                carouselApiRef.current = api;
                if (api) {
                  api.on('select', () => {
                    setCurrentImageIndex(api.selectedScrollSnap());
                  });
                }
              }}
            >
              <CarouselContent>
                {event.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden">
                      <img
                        src={image || '/placeholder-event.jpg'}
                        alt={`${event.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      

                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />

            </Carousel>
          ) : (
            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] overflow-hidden">
              <img
                src="/placeholder-event.jpg"
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}
          
          {/* Back Button */}
          <div className="absolute top-2 sm:top-4 md:top-8 left-2 sm:left-4">
            <Link href="/events">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20 text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 md:mr-2" />
                <span className="hidden sm:inline">Back to Adventures</span>
              </Button>
            </Link>
          </div>

          {/* Share Button */}
          <div className="absolute top-2 sm:top-4 md:top-8 right-2 sm:right-4">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20 text-xs sm:text-sm"
              onClick={handleShare}
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 md:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          {/* Event Info Overlay */}
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 left-2 sm:left-4 right-2 sm:right-4">
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
              <Badge className={getDifficultyColor(event.difficulty)}>
                {formatDifficulty(event.difficulty)}
              </Badge>
              <Badge variant="secondary" className="bg-background/90 text-foreground">
                {event.category}
              </Badge>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-product-sans font-bold text-primary-foreground mb-1 sm:mb-2">
              {event.title}
            </h1>
            <div className="flex flex-col text-white/90 text-xs sm:text-sm gap-0.5">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{event.location?.name}, {event.location?.state}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{event.duration} {event.duration === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span>{event.maxParticipants} people</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Dots Indicator */}
        {event.images && event.images.length > 1 && (
          <div className="flex justify-center py-4 bg-background/95">
            <div className="flex space-x-2">
              {event.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentImageIndex === index
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Available Dates Section - Above Tabs */}
              {(event.availableDates && event.availableDates.length > 0) && (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Available Dates
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {event.availableDates.map((dateGroup, index) => {
                      const monthKey = `${dateGroup.month}-${dateGroup.year}`;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedMonth(selectedMonth === monthKey ? null : monthKey)}
                          className={`px-6 py-3 rounded-full text-sm font-medium border-2 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                            selectedMonth === monthKey
                              ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                              : 'bg-background hover:bg-primary/10 border-border hover:border-primary/50 hover:text-primary'
                          }`}
                        >
                          {dateGroup.month} {dateGroup.year}
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedMonth && (
                    <div className="mt-4 p-3 bg-background rounded-xl border border-border/50 shadow-sm">
                      {event.availableDates
                        .filter(dateGroup => `${dateGroup.month}-${dateGroup.year}` === selectedMonth)
                        .map((dateGroup, index) => (
                          <div key={index}>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
                              {dateGroup.dates.map((date, dateIndex) => (
                                <button
                                  key={dateIndex}
                                  className="h-11 w-11 flex items-center justify-center text-center border-2 rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md text-sm font-medium bg-background border-border hover:border-primary/50"
                                >
                                  {date}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                  
                  {!selectedMonth && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Click on a month to view available dates
                    </p>
                  )}
                </div>
              )}

              {/* Tabs - Carousel on mobile, regular tabs on desktop */}
              <div className="mb-8">
                {/* Mobile Carousel */}
                <div className="md:hidden">
                  <Carousel className="w-full" opts={{ align: "start", containScroll: "trimSnaps" }}>
                    <CarouselContent className="-ml-1">
                      {tabs.map((tab) => (
                        <CarouselItem key={tab.id} className="pl-1 basis-auto">
                          <button
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-2 font-medium transition-colors whitespace-nowrap rounded-full border text-xs min-w-[80px] ${
                              activeTab === tab.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground hover:text-foreground border-border hover:border-primary/50'
                            }`}
                          >
                            {tab.label}
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
                
                {/* Desktop Tabs */}
                <div className="hidden md:flex flex-wrap gap-2 border-b border-border">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-product-sans font-bold mb-4">About This Adventure</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {event.shortDescription}
                    </p>
                    <p className="text-lg text-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Quick Facts</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">Duration: {event.duration} {event.duration === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">Location: {event.location?.name}, {event.location?.state}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">Max Participants: {event.maxParticipants}</span>
                        </div>
                        <div className="flex items-center">
                          <Mountain className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">Difficulty: {formatDifficulty(event.difficulty)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Highlights</h3>
                      <ul className="space-y-2">
                        {event.highlights?.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-product-sans font-bold mb-4">Day by Day Itinerary</h2>
                  <div className="space-y-3">
                    {event.itinerary?.map((day, index) => {
                      const isExpanded = expandedDays.has(day.day);
                      const hasAdditionalInfo = (day.images && day.images.length > 0) || 
                                               (day.activities && day.activities.length > 0) || 
                                               (day.meals && day.meals.length > 0) || 
                                               day.accommodation;
                      
                      return (
                        <div key={index} className="bg-muted/30 rounded-lg overflow-hidden">
                          <button
                            onClick={() => hasAdditionalInfo && toggleDayExpansion(day.day)}
                            className={`w-full flex items-center p-4 text-left transition-colors ${
                              hasAdditionalInfo ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <div className="bg-gray-600 text-white rounded-full px-3 py-1 text-sm font-medium mr-4 min-w-fit">
                              Day {day.day === 0 ? 'D' : day.day}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-base text-foreground">
                                {day.title}
                              </h3>
                            </div>
                            {hasAdditionalInfo && (
                              <div className="ml-2">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </button>
                          
                          {isExpanded && hasAdditionalInfo && (
                            <div className="px-4 pb-4 space-y-4 border-t border-border/50">
                              <p className="text-muted-foreground text-sm mt-4">{day.description}</p>
                              
                              {day.location && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {day.location}
                                </div>
                              )}
                              
                              {/* Day Images Carousel */}
                              {day.images && day.images.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-3 flex items-center">
                                    <Camera className="h-4 w-4 mr-1 text-primary" />
                                    Day Photos
                                  </h4>
                                  <Carousel className="w-full">
                                    <CarouselContent>
                                      {day.images.map((image, imgIndex) => (
                                        <CarouselItem key={imgIndex}>
                                          <div className="aspect-video bg-muted overflow-hidden rounded-lg">
                                            <img
                                              src={image}
                                              alt={`Day ${day.day} - Photo ${imgIndex + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        </CarouselItem>
                                      ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="hidden md:flex" />
                                    <CarouselNext className="hidden md:flex" />
                                  </Carousel>
                                </div>
                              )}
                              
                              {day.activities && day.activities.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 flex items-center">
                                    <Compass className="h-4 w-4 mr-1 text-primary" />
                                    Activities
                                  </h4>
                                  <ul className="space-y-1">
                                    {day.activities.map((activity, actIndex) => (
                                      <li key={actIndex} className="text-sm text-muted-foreground flex items-start">
                                        <CheckCircle className="h-3 w-3 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {day.meals && day.meals.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 flex items-center">
                                    <Utensils className="h-4 w-4 mr-1 text-primary" />
                                    Meals
                                  </h4>
                                  <ul className="space-y-1">
                                    {day.meals.map((meal, mealIndex) => (
                                      <li key={mealIndex} className="text-sm text-muted-foreground flex items-start">
                                        <CheckCircle className="h-3 w-3 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                                        {meal}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {day.accommodation && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 flex items-center">
                                    <Flag className="h-4 w-4 mr-1 text-primary" />
                                    Accommodation
                                  </h4>
                                  <p className="text-sm text-muted-foreground">{day.accommodation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}



              {activeTab === 'inclusions' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-product-sans font-bold mb-4">What's Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-600">Included</h3>
                      <ul className="space-y-2">
                        {event.inclusions?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-600">Not Included</h3>
                      <ul className="space-y-2">
                        {event.exclusions?.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <XCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preparation' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-product-sans font-bold mb-4">Preparation Guide</h2>
                  <div className="space-y-6">
                    {event.preparation?.physicalRequirements && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Mountain className="h-5 w-5 mr-2 text-primary" />
                          Physical Requirements
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {event.preparation.physicalRequirements}
                        </p>
                      </div>
                    )}
                    
                    {event.preparation?.medicalRequirements && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-primary" />
                          Medical Requirements
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {event.preparation.medicalRequirements}
                        </p>
                      </div>
                    )}
                    
                    {event.preparation?.experienceLevel && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <Star className="h-5 w-5 mr-2 text-primary" />
                          Experience Level Required
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {event.preparation.experienceLevel}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Backpack className="h-5 w-5 mr-2 text-primary" />
                        What to Pack
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {event.thingsToCarry?.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        Safety Guidelines
                      </h3>
                      {event.preparation?.safetyGuidelines && event.preparation.safetyGuidelines.length > 0 ? (
                        <ul className="space-y-2">
                          {event.preparation.safetyGuidelines.map((guideline, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{guideline}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <p>Please follow all safety instructions provided by our guides during the adventure.</p>
                          <p>Ensure you have proper travel insurance and medical clearance if required.</p>
                        </div>
                      )}
                    </div>
                    
                    {event.preparation?.additionalNotes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {event.preparation.additionalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card - Hidden on mobile, shown on desktop */}
              <div className="card-adventure p-6 hidden lg:block">
                <div className="text-center mb-4">
                  {event.discountedPrice && event.discountedPrice > 0 && event.discountedPrice < event.price ? (
                    <div>
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{event.price.toLocaleString()}
                        </span>
                        <div className="text-3xl font-bold text-green-600">
                          ₹{event.discountedPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">per person</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-primary mb-1">
                        ₹{event.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">per person</div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Season:</span>
                    <span className="font-medium">{event.season}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Age Limit:</span>
                    <span className="font-medium">{event.ageLimit.min}-{event.ageLimit.max} years</span>
                  </div>
                </div>
                
                <Button 
                  className="btn-hero w-full mb-3"
                  onClick={() => router.push(`/events/${params.slug}/book`)}
                >
                  Book Now
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Wishlist
                </Button>
              </div>

              {/* Contact Info */}
              <div className="card-adventure p-6">
                <h3 className="font-semibold mb-4">Need Help?</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Call us</div>
                    <div className="text-muted-foreground">+91 98765 43210</div>
                  </div>
                  <div>
                    <div className="font-medium">Email us</div>
                    <div className="text-muted-foreground">hello@avidexplorers.com</div>
                  </div>
                  <div>
                    <div className="font-medium">WhatsApp</div>
                    <div className="text-muted-foreground">Available 24/7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-product-sans font-bold text-center mb-12">
              Similar Adventures
            </h2>
            {relatedLoading ? (
              <div className="flex justify-center">
                <LoadingRing size="md" />
              </div>
            ) : relatedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedEvents.map((relatedEvent) => (
                  <EventCard key={relatedEvent._id} event={relatedEvent} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No similar adventures found.</p>
            )}
          </div>
        </section>
      </article>

      <Footer />
      
      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {event.discountedPrice && event.discountedPrice > 0 && event.discountedPrice < event.price ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground line-through">
                  ₹{event.price.toLocaleString()}
                </span>
                <span className="text-xl font-bold text-green-600">
                  ₹{event.discountedPrice.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">per person</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  ₹{event.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">per person</span>
              </div>
            )}
          </div>
          <Button 
            className="btn-hero px-8"
            onClick={() => router.push(`/events/${params.slug}/book`)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}