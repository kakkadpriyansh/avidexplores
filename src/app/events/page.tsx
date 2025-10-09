'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Mountain, MapPin, Trees, Waves, Building2, Globe } from 'lucide-react';

interface Event {
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
  region?: string;
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
  isActive: boolean;
  isFeatured: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events?limit=50'); // Fetch more events for the public page
        const data = await response.json();
        
        if (data.success) {
          setEvents(data.data);
          setFilteredEvents(data.data);
        } else {
          setError('Failed to load events');
        }
      } catch (err) {
        setError('Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term and selected region
  useEffect(() => {
    let filtered = events;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(event => {
        const locationString = typeof event.location === 'string' 
          ? event.location 
          : `${event.location?.name || ''} ${event.location?.state || ''}`;
        
        return event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               locationString.toLowerCase().includes(searchTerm.toLowerCase()) ||
               event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (event.region && event.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
               event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }
    
    // Filter by selected region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(event => 
        (event.region || 'Other Adventures') === selectedRegion
      );
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, selectedRegion, events]);

  // Get all unique regions from events
  const allRegions = Array.from(new Set(events.map(event => event.region || 'Other Adventures')));
  const sortedAllRegions = allRegions.sort((a, b) => {
    if (a === 'Other Adventures') return 1;
    if (b === 'Other Adventures') return -1;
    return a.localeCompare(b);
  });

  // Group filtered events by region for display
  const groupedEvents = filteredEvents.reduce((groups: { [key: string]: Event[] }, event) => {
    const region = event.region || 'Other Adventures';
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(event);
    return groups;
  }, {});

  // Sort regions for display - prioritize selected region
  const sortedRegions = Object.keys(groupedEvents).sort((a, b) => {
    if (selectedRegion !== 'all') {
      if (a === selectedRegion) return -1;
      if (b === selectedRegion) return 1;
    }
    if (a === 'Other Adventures') return 1;
    if (b === 'Other Adventures') return -1;
    return a.localeCompare(b);
  });

  // Region icon mapping
  const getRegionIcon = (region: string) => {
    const iconMap: { [key: string]: any } = {
      'Himalayas': Mountain,
      'Western Ghats': Trees,
      'Coastal': Waves,
      'Urban': Building2,
      'Other Adventures': Globe,
    };
    return iconMap[region] || MapPin;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section
        className="relative w-full pt-24 pb-12 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE5E5] via-[#FFF5F5] to-[#F8F8F8]"
      >
        <h2 className="relative z-10 text-4xl md:text-5xl font-extrabold text-[#B71C1C] mb-2 text-center drop-shadow-sm">
          All Adventures
        </h2>
        <div className="relative z-10 w-16 h-1 bg-[#B71C1C] rounded-full mb-4" />
        <p className="relative z-10 text-lg md:text-xl text-[#333] mb-2 text-center max-w-2xl">
          Discover amazing adventures tailored to your interests and skill level
        </p>
      </section>

      {/* Region Tabs */}
      <section className="py-6 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6">
            <Button
              variant={selectedRegion === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('all')}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <Globe className="h-4 w-4" />
              All Regions
            </Button>
            {sortedAllRegions.map((region) => {
              const IconComponent = getRegionIcon(region);
              const regionCount = events.filter(event => (event.region || 'Other Adventures') === region).length;
              return (
                <Button
                  key={region}
                  variant={selectedRegion === region ? 'default' : 'outline'}
                  onClick={() => setSelectedRegion(region)}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <IconComponent className="h-4 w-4" />
                  {region} ({regionCount})
                </Button>
              );
            })}
          </div>
          
          {/* Search */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search adventures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events by Region */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading adventures...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-lg text-red-600 mb-4">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                {searchTerm ? 'No adventures found matching your search' : 'No adventures available at the moment'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}