'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';

interface EventItem {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  locationStr: string;
  durationStr: string;
  maxParticipants: number;
  currentBookings?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  createdAt: string;
}

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/events');
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    fetchEvents();
  }, [session, status, router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?admin=true');
      if (response.ok) {
        const data = await response.json();
        const items: EventItem[] = (data.data || []).map((e: any) => ({
          _id: e._id,
          title: e.title,
          slug: e.slug,
          price: e.price,
          discountedPrice: e.discountedPrice,
          locationStr: e?.location?.name || e?.location?.state || '—',
          durationStr: e?.duration ? `${e.duration} days` : '—',
          maxParticipants: e.maxParticipants,
          currentBookings: e.currentBookings || 0,
          status: e.isActive ? 'PUBLISHED' : 'DRAFT',
          createdAt: e.createdAt
        }));
        setEvents(items);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: newStatus === 'PUBLISHED' })
      });
      
      if (response.ok) {
        setEvents(events.map(event => 
          event._id === eventId ? { ...event, status: newStatus as any } : event
        ));
      }
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.locationStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Removed <Navigation /> since Admin layout provides header */}
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-foreground mb-2">
                Event Management
              </h1>
              <p className="text-muted-foreground">
                Create, edit, and manage adventure events
              </p>
            </div>
            <Button 
              onClick={() => router.push('/admin/events/create')}
              className="mt-4 sm:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>

          {/* Filters */}
          <Card className="card-adventure mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search events by title or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No events found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'No events match your current filters.' 
                    : 'Get started by creating your first event.'}
                </p>
                <Button onClick={() => router.push('/admin/events/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event._id} className="card-adventure">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {event.title}
                      </CardTitle>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.locationStr}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.durationStr}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          {event.currentBookings || 0}/{event.maxParticipants}
                        </div>
                        <div className="flex items-center font-semibold text-primary">
                          {event.discountedPrice ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{event.price.toLocaleString()}
                              </span>
                              <span>₹{event.discountedPrice.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span>₹{event.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/events/${event.slug}`)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/events/${event._id}/edit`)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {event.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(event._id, 'PUBLISHED')}
                          className="w-full mt-2"
                        >
                          Publish Event
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Removed <Footer /> */}
    </div>
  );
}