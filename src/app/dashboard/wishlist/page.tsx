'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout, DashboardSearch } from '@/components/dashboard/DashboardLayout';
import { 
  ArrowLeft,
  Search,
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  Trash2,
  ExternalLink,
  Filter,
  Grid,
  List
} from 'lucide-react';

interface WishlistEvent {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    duration: string;
    difficulty: string;
    maxParticipants: number;
    images: string[];
    rating: number;
    reviewCount: number;
    category: string;
    startDate: string;
    endDate: string;
  };
  addedAt: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/dashboard/wishlist');
      return;
    }
    
    fetchWishlist();
  }, [session, status, router]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (eventId: string) => {
    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      });
      
      if (response.ok) {
        setWishlist(wishlist.filter(item => item.eventId._id !== eventId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const filteredWishlist = wishlist.filter(item => {
    const matchesSearch = 
      item.eventId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.eventId.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.eventId.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || item.eventId.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(wishlist.map(item => item.eventId.category)));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout 
        title="My Wishlist"
        description="Your saved adventures for future booking"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-64 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout 
      title="My Wishlist"
      description="Your saved adventures for future booking"
    >
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-adventure mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <DashboardSearch 
                placeholder="Search events by name, location, or description..."
                onSearch={setSearchTerm}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="ALL">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Wishlist Content */}
          {filteredWishlist.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {wishlist.length === 0 ? 'Your wishlist is empty' : 'No events match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {wishlist.length === 0
                    ? "Start exploring and save your favorite adventures!"
                    : "Try adjusting your search or filter criteria."}
                </p>
                <Button onClick={() => router.push('/events')}>
                  Explore Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
              {filteredWishlist.map((item) => (
                viewMode === 'grid' ? (
                  // Grid View
                  <Card key={item._id} className="card-adventure group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                        {item.eventId.images.length > 0 ? (
                          <img
                            src={item.eventId.images[0]}
                            alt={item.eventId.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFromWishlist(item.eventId._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {item.eventId.title}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="line-clamp-1">{item.eventId.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge className={getDifficultyColor(item.eventId.difficulty)}>
                              {item.eventId.difficulty}
                            </Badge>
                            <span className="text-muted-foreground">{item.eventId.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-muted-foreground">
                              {item.eventId.rating} ({item.eventId.reviewCount})
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-primary">
                            ₹{item.eventId.price.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            <span>Max {item.eventId.maxParticipants}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/events/${item.eventId._id}`)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/events/${item.eventId._id}/book`)}
                          >
                            Book Now
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Added on {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // List View
                  <Card key={item._id} className="card-adventure">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Event Image */}
                        <div className="lg:w-48 flex-shrink-0">
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            {item.eventId.images.length > 0 ? (
                              <img
                                src={item.eventId.images[0]}
                                alt={item.eventId.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Event Details */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground mb-1">
                                {item.eventId.title}
                              </h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {item.eventId.location}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.eventId.description}
                              </p>
                            </div>
                            <div className="flex flex-col sm:items-end space-y-2 mt-2 sm:mt-0">
                              <div className="text-2xl font-semibold text-primary">
                                ₹{item.eventId.price.toLocaleString()}
                              </div>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm text-muted-foreground">
                                  {item.eventId.rating} ({item.eventId.reviewCount} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{item.eventId.duration}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Max {item.eventId.maxParticipants}</span>
                            </div>
                            <div>
                              <Badge className={getDifficultyColor(item.eventId.difficulty)}>
                                {item.eventId.difficulty}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Added {new Date(item.addedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => router.push(`/events/${item.eventId._id}`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/events/${item.eventId._id}/book`)}
                            >
                              Book Now
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => removeFromWishlist(item.eventId._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          )}
    </DashboardLayout>
  );
}