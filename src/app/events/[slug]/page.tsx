'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Sunrise
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Database Event interface
interface DatabaseEvent {
  _id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch the specific event
        const eventResponse = await fetch(`/api/events/${slug}`);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          setEvent(eventData.data);
        } else {
          console.error('Failed to fetch event:', eventResponse.status);
          router.push('/events');
          return;
        }

        // Fetch related events
        const eventsResponse = await fetch('/api/events');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          const allEvents = eventsData.events || [];
          const related = allEvents.filter((e: DatabaseEvent) => e.slug !== slug).slice(0, 3);
          setRelatedEvents(related);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        router.push('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug, router]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Compute itinerary helpers
  const hasDeparture = event?.itinerary?.some((d) => d.day === 0) ?? false;
  const totalDays = event ? Math.max(...event.itinerary.map((d) => d.day)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
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
        {/* Cover Image */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={event.images?.[0] || '/placeholder-event.jpg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-8 left-4">
            <Link href="/events">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Adventures
              </Button>
            </Link>
          </div>

          {/* Share Button */}
          <div className="absolute top-8 right-4">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Event Info Overlay */}
          <div className="absolute bottom-8 left-4 right-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getDifficultyColor(event.difficulty)}>
                {formatDifficulty(event.difficulty)}
              </Badge>
              <Badge variant="secondary" className="bg-background/90 text-foreground">
                {event.category}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-primary-foreground mb-2">
              {event.title}
            </h1>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="mr-4">{event.location?.name}, {event.location?.state}</span>
              <Clock className="h-4 w-4 mr-1" />
              <span className="mr-4">{event.duration} {event.duration === 1 ? 'day' : 'days'}</span>
              <Users className="h-4 w-4 mr-1" />
              <span>Max {event.maxParticipants} people</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
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

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-montserrat font-bold mb-4">About This Adventure</h2>
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
                  <h2 className="text-2xl font-montserrat font-bold mb-4">Day by Day Itinerary</h2>
                  <div className="space-y-4">
                    {event.itinerary?.map((day, index) => (
                      <div key={index} className="border border-border rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                            {day.day === 0 ? 'D' : day.day}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {day.day === 0 ? 'Departure Day' : `Day ${day.day}`}: {day.title}
                            </h3>
                            {day.location && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {day.location}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-11 space-y-4">
                          <p className="text-muted-foreground">{day.description}</p>
                          
                          {day.activities && day.activities.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center">
                                <Mountain className="h-4 w-4 mr-1 text-primary" />
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
                                <Sunrise className="h-4 w-4 mr-1 text-primary" />
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'inclusions' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-montserrat font-bold mb-4">What's Included</h2>
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
                  <h2 className="text-2xl font-montserrat font-bold mb-4">Preparation Guide</h2>
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
              {/* Booking Card */}
              <div className="card-adventure p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary mb-1">
                    ₹{event.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">per person</div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Season:</span>
                    <span className="font-medium">{event.season}</span>
                  </div>
                  {event.availableMonths && event.availableMonths.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Available Months:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.availableMonths.map((month, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {month}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {event.availableDates && event.availableDates.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Available Dates:</span>
                      <div className="space-y-2 mt-2">
                        {event.availableDates.map((dateEntry, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {dateEntry.month} {dateEntry.year}
                              </span>
                              {dateEntry.location && (
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {dateEntry.location}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {dateEntry.dates.map((date, dateIndex) => (
                                <Badge key={dateIndex} variant="outline" className="text-xs px-2 py-1">
                                  {date}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <div className="text-muted-foreground">hello@avidexplores.com</div>
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
        {relatedEvents.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
                Similar Adventures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedEvents.map((relatedEvent) => (
                  <EventCard key={relatedEvent._id} event={relatedEvent} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
}