import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockEvents } from '@/data/mockData';
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
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const EventDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const event = mockEvents.find(e => e.slug === slug);
  const relatedEvents = mockEvents.filter(e => e.slug !== slug).slice(0, 3);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-montserrat font-bold">Adventure not found</h1>
          <Link to="/events">
            <Button className="mt-4 btn-adventure">Back to Adventures</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Challenging':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-8 left-4">
            <Link to="/events">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Adventures
              </Button>
            </Link>
          </div>

          {/* Share Button */}
          <div className="absolute top-8 right-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
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
                {event.difficulty}
              </Badge>
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                {event.category}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-white mb-2">
              {event.title}
            </h1>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        {/* Event Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{event.duration}</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Group Size</p>
                    <p className="font-semibold">Up to {event.maxParticipants}</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Season</p>
                    <p className="font-semibold">{event.season}</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Age Limit</p>
                    <p className="font-semibold">{event.ageLimit}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-border mb-8">
                  <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {activeTab === 'overview' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">About This Adventure</h3>
                      <p className="text-muted-foreground mb-6">{event.description}</p>
                      
                      <h4 className="text-lg font-semibold mb-3">Highlights</h4>
                      <ul className="space-y-2 mb-6">
                        {event.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Star className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>

                      <h4 className="text-lg font-semibold mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'itinerary' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Day-by-Day Itinerary</h3>
                      <div className="space-y-6">
                        {event.itinerary.map((day) => (
                          <div key={day.day} className="border-l-2 border-primary pl-6 pb-6">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                                {day.day}
                              </div>
                              <h4 className="text-lg font-semibold">{day.title}</h4>
                            </div>
                            <p className="text-muted-foreground">{day.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'inclusions' && (
                    <div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-green-600">What's Included</h3>
                          <ul className="space-y-2">
                            {event.inclusions.map((inclusion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                                <span>{inclusion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-red-600">What's Not Included</h3>
                          <ul className="space-y-2">
                            {event.exclusions.map((exclusion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <XCircle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                                <span>{exclusion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'preparation' && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Things to Carry</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {event.thingsToCarry.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                            <Backpack className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Booking Card */}
                <div className="sticky top-24 bg-card border border-border rounded-lg p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-montserrat font-bold text-foreground">
                      ₹{event.price.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">per person</div>
                  </div>
                  
                  <Button className="w-full btn-adventure mb-4">
                    Book Now
                  </Button>
                  
                  <Button variant="outline" className="w-full mb-4">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Wishlist
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Free cancellation up to 24 hours before the trip
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
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-montserrat font-bold text-center mb-12">
                  Similar Adventures
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedEvents.map((relatedEvent) => (
                    <EventCard key={relatedEvent.id} event={relatedEvent} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default EventDetail;