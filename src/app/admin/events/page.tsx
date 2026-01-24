'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasPermission } from '@/lib/permissions';
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
  Users,
  CheckCircle
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

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
    if (!hasPermission(session, 'events')) {
      router.push('/admin');
      return;
    }
    
    fetchEvents();
  }, [session, status, router]);

  // Refresh events when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      fetchEvents();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?limit=50');
      if (response.ok) {
        const data = await response.json();
        const items: EventItem[] = (data.data || []).map((e: any) => {
          // Get display price from departures if available, otherwise use main price
          let displayPrice = e.price || 0;
          let displayDiscountedPrice = e.discountedPrice;
          
          if (e.departures && e.departures.length > 0) {
            const selectedDep = e.departures.find((d: any) => d.isSelected);
            const dep = selectedDep || e.departures[0];
            if (dep && dep.price && dep.price > 0) {
              displayPrice = dep.price;
              displayDiscountedPrice = dep.discountedPrice;
            }
          }
          
          return {
            _id: e._id,
            title: e.title,
            slug: e.slug,
            price: displayPrice,
            discountedPrice: displayDiscountedPrice ? Number(displayDiscountedPrice) : undefined,
            locationStr: e?.location?.name || e?.location?.state || '—',
            durationStr: e?.duration ? `${e.duration} days` : '—',
            maxParticipants: e.maxParticipants,
            currentBookings: e.currentBookings || 0,
            status: e.isActive ? 'PUBLISHED' : 'DRAFT',
            createdAt: e.createdAt
          };
        });
        setEvents(items);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
        alert('Event deleted successfully');
      } else {
        alert(data.error || `Failed to delete event (${response.status})`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Network error occurred while deleting event');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
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

  if (!session || !hasPermission(session, 'events')) {
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
              <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">
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

          {/* Events Table */}
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
            <Card className="card-adventure">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Title</th>
                        <th className="text-left p-4 font-semibold">Location</th>
                        <th className="text-left p-4 font-semibold">Duration</th>
                        <th className="text-left p-4 font-semibold">Participants</th>
                        <th className="text-left p-4 font-semibold">Price</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Created</th>
                        <th className="text-left p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event._id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-4">
                            <div className="font-medium line-clamp-2">{event.title}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.locationStr}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {event.durationStr}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {(event.currentBookings || 0)}/{event.maxParticipants}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-primary">
                              {event.discountedPrice ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-muted-foreground line-through">
                                    ₹{(event.price || 0).toLocaleString()}
                                  </span>
                                  <span>₹{(event.discountedPrice || 0).toLocaleString()}</span>
                                </div>
                              ) : (
                                <span>₹{(event.price || 0).toLocaleString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">{new Date(event.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            <TooltipProvider>
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 [&_svg]:size-3"
                                      aria-label="View"
                                      onClick={() => router.push(`/events/${event.slug}`)}
                                    >
                                      <Eye />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 [&_svg]:size-3"
                                      aria-label="Edit"
                                      onClick={() => router.push(`/admin/events/${event._id}/edit`)}
                                    >
                                      <Edit />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 [&_svg]:size-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      aria-label="Delete"
                                      onClick={() => handleDeleteEvent(event._id)}
                                    >
                                      <Trash2 />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>

                                {event.status === 'DRAFT' && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 [&_svg]:size-3"
                                        aria-label="Publish"
                                        onClick={() => handleStatusChange(event._id, 'PUBLISHED')}
                                      >
                                        <CheckCircle />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Publish</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TooltipProvider>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Removed <Footer /> */}
    </div>
  );
}