'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasPermission } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Calendar, Eye, Download, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DateInfo {
  month: string;
  year: number;
  day: number;
  bookings: Booking[];
}

interface Booking {
  _id: string;
  bookingId: string;
  userId: { _id: string; name: string; email: string; phone?: string };
  eventId: { _id: string; title: string; location: string; price: number };
  participants: {
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    medicalConditions?: string;
    dietaryRestrictions?: string;
  }[];
  totalAmount: number;
  status: string;
  paymentInfo: { paymentStatus: string; paymentMethod: string; transactionId?: string };
  selectedDeparture?: string;
  selectedTransportMode?: string;
  date: string;
  createdAt: string;
}

interface Event {
  _id: string;
  title: string;
  departures?: { label: string; availableDates: { month: string; year: number; dates: number[] }[] }[];
}

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [expandedDepartures, setExpandedDepartures] = useState<Set<string>>(new Set());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/bookings');
      return;
    }
    if (!hasPermission(session, 'bookings')) {
      router.push('/admin');
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, eventsRes] = await Promise.all([
        fetch('/api/bookings?limit=1000'),
        fetch('/api/events?admin=true&limit=1000')
      ]);
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    const newSet = new Set(expandedEvents);
    if (newSet.has(eventId)) newSet.delete(eventId);
    else newSet.add(eventId);
    setExpandedEvents(newSet);
  };

  const toggleDeparture = (key: string) => {
    const newSet = new Set(expandedDepartures);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedDepartures(newSet);
  };

  const toggleDate = (key: string) => {
    const newSet = new Set(expandedDates);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExpandedDates(newSet);
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Event', 'Departure', 'Date', 'Customer', 'Email', 'Participant Name', 'Participant Age', 'Participant Gender', 'Participant Phone', 'Participant Email', 'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Relationship', 'Medical Conditions', 'Dietary Restrictions', 'Transport', 'Amount', 'Status', 'Payment'].join(','),
      ...bookings.filter(b => b && b.eventId && b.userId).flatMap(b => 
        b.participants.map((participant, index) => [
          index === 0 ? b.bookingId : '', // Only show booking ID for first participant
          index === 0 ? (b.eventId?.title || 'Unknown Event') : '',
          index === 0 ? (b.selectedDeparture || '') : '',
          index === 0 ? new Date(b.date).toLocaleDateString() : '',
          index === 0 ? (b.userId?.name || 'Unknown User') : '',
          index === 0 ? (b.userId?.email || '') : '',
          participant.name || '',
          participant.age || '',
          participant.gender || '',
          participant.phone || '',
          participant.email || '',
          participant.emergencyContact?.name || '',
          participant.emergencyContact?.phone || '',
          participant.emergencyContact?.relationship || '',
          participant.medicalConditions || '',
          participant.dietaryRestrictions || '',
          index === 0 ? (b.selectedTransportMode || '') : '',
          index === 0 ? b.totalAmount : '',
          index === 0 ? b.status : '',
          index === 0 ? (b.paymentInfo?.paymentStatus || 'UNKNOWN') : ''
        ].join(','))
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getBookingsForDate = (eventId: string, departure: string, month: string, year: number, date: number) => {
    const dateBookings = bookings.filter(b => {
      if (!b.eventId || b.eventId._id !== eventId || b.selectedDeparture !== departure) {
        return false;
      }
      
      const bookingDate = new Date(b.date);
      const bookingMonth = bookingDate.toLocaleString('default', { month: 'long' });
      const bookingYear = bookingDate.getFullYear();
      const bookingDay = bookingDate.getDate();
      
      return bookingMonth === month && bookingYear === year && bookingDay === date;
    });
    
    return dateBookings;
  };

  const getBookingsForDeparture = (eventId: string, departure: string) => {
    return bookings.filter(b => 
      b.eventId &&
      b.eventId._id === eventId &&
      b.selectedDeparture === departure
    );
  };

  const getBookingsForEvent = (eventId: string) => {
    return bookings.filter(b => 
      b.eventId &&
      b.eventId._id === eventId
    );
  };

  const filteredBookings = bookings.filter(b => {
    if (!b || !b.userId || !b.eventId) return false;
    
    const matchesSearch = !searchQuery || 
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.userId.name && b.userId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.userId.email && b.userId.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.eventId.title && b.eventId.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const bookingDate = new Date(b.date);
    const matchesStartDate = !startDate || bookingDate >= new Date(startDate);
    const matchesEndDate = !endDate || bookingDate <= new Date(endDate);
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const filteredEvents = events.filter(event => {
    if (!event) return false;
    if (!searchQuery && !startDate && !endDate) return true;
    const eventBookings = getBookingsForEvent(event._id).filter(b => filteredBookings.includes(b));
    const eventMatchesSearch = !searchQuery || (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return eventMatchesSearch || eventBookings.length > 0;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !hasPermission(session, 'bookings')) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">Booking Management</h1>
                <p className="text-muted-foreground">View bookings organized by event, departure, and date</p>
              </div>
              <Button onClick={exportBookings}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by booking ID, customer name, email, or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
                {(startDate || endDate) && (
                  <Button variant="outline" size="icon" onClick={() => { setStartDate(''); setEndDate(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card className="card-adventure">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No events found matching your search criteria
                </CardContent>
              </Card>
            ) : null}
            {filteredEvents.map(event => {
              const eventBookings = getBookingsForEvent(event._id).filter(b => filteredBookings.includes(b));
              const isEventExpanded = expandedEvents.has(event._id);
              
              return (
                <Card key={event._id} className="card-adventure">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/20">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleEvent(event._id)}>
                        {isEventExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{eventBookings.length} total bookings</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        const csv = [
                          ['Booking ID', 'Departure', 'Date', 'Customer', 'Email', 'Phone', 'Participant Name', 'Participant Age', 'Participant Gender', 'Participant Phone', 'Participant Email', 'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Relationship', 'Medical Conditions', 'Dietary Restrictions', 'Transport', 'Amount', 'Status', 'Payment'].join(','),
                          ...eventBookings.flatMap(b => 
                            b.participants.map((participant, index) => [
                              index === 0 ? b.bookingId : '',
                              index === 0 ? (b.selectedDeparture || '') : '',
                              index === 0 ? new Date(b.date).toLocaleDateString() : '',
                              index === 0 ? b.userId.name : '',
                              index === 0 ? b.userId.email : '',
                              index === 0 ? (b.userId.phone || '') : '',
                              participant.name || '',
                              participant.age || '',
                              participant.gender || '',
                              participant.phone || '',
                              participant.email || '',
                              participant.emergencyContact?.name || '',
                              participant.emergencyContact?.phone || '',
                              participant.emergencyContact?.relationship || '',
                              participant.medicalConditions || '',
                              participant.dietaryRestrictions || '',
                              index === 0 ? (b.selectedTransportMode || '') : '',
                              index === 0 ? b.totalAmount : '',
                              index === 0 ? b.status : '',
                              index === 0 ? b.paymentInfo.paymentStatus : ''
                            ].join(','))
                          )
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${event.title.replace(/\s+/g, '-')}-bookings.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>

                    {isEventExpanded && (
                      <div className="border-t border-border/50">
                        {!event.departures || event.departures.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">No departures configured</div>
                        ) : (
                          event.departures.map((departure, depIdx) => {
                            const depKey = `${event._id}-${depIdx}`;
                            const isDepartureExpanded = expandedDepartures.has(depKey);
                            const depBookings = getBookingsForDeparture(event._id, departure.label).filter(b => filteredBookings.includes(b));
                            if (depBookings.length === 0 && (searchQuery || startDate || endDate)) return null;

                            return (
                              <div key={depKey} className="border-b border-border/30 last:border-0">
                                <div className="flex items-center justify-between p-4 pl-12 hover:bg-muted/10">
                                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleDeparture(depKey)}>
                                    {isDepartureExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <div>
                                      <h4 className="font-medium">{departure.label}</h4>
                                      <p className="text-xs text-muted-foreground">{depBookings.length} bookings</p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline" onClick={(e) => {
                                    e.stopPropagation();
                                    const csv = [
                                      ['Booking ID', 'Date', 'Customer', 'Email', 'Phone', 'Participant Name', 'Participant Age', 'Participant Gender', 'Participant Phone', 'Participant Email', 'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Relationship', 'Medical Conditions', 'Dietary Restrictions', 'Transport', 'Amount', 'Status', 'Payment'].join(','),
                                      ...depBookings.flatMap(b => 
                                        b.participants.map((participant, index) => [
                                          index === 0 ? b.bookingId : '',
                                          index === 0 ? new Date(b.date).toLocaleDateString() : '',
                                          index === 0 ? b.userId.name : '',
                                          index === 0 ? b.userId.email : '',
                                          index === 0 ? (b.userId.phone || '') : '',
                                          participant.name || '',
                                          participant.age || '',
                                          participant.gender || '',
                                          participant.phone || '',
                                          participant.email || '',
                                          participant.emergencyContact?.name || '',
                                          participant.emergencyContact?.phone || '',
                                          participant.emergencyContact?.relationship || '',
                                          participant.medicalConditions || '',
                                          participant.dietaryRestrictions || '',
                                          index === 0 ? (b.selectedTransportMode || '') : '',
                                          index === 0 ? b.totalAmount : '',
                                          index === 0 ? b.status : '',
                                          index === 0 ? b.paymentInfo.paymentStatus : ''
                                        ].join(','))
                                      )
                                    ].join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${event.title.replace(/\s+/g, '-')}-${departure.label.replace(/\s+/g, '-')}-bookings.csv`;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                  }}>
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>

                                {isDepartureExpanded && (
                                  <div className="bg-muted/5">
                                    {(() => {
                                      // Get all unique dates from bookings for this departure
                                      const allBookingDates = depBookings.reduce((dates, booking) => {
                                        const bookingDate = new Date(booking.date);
                                        const month = bookingDate.toLocaleString('default', { month: 'long' });
                                        const year = bookingDate.getFullYear();
                                        const day = bookingDate.getDate();
                                        const dateKey = `${month}-${year}-${day}`;
                                        
                                        if (!dates[dateKey]) {
                                          dates[dateKey] = {
                                            month,
                                            year,
                                            day,
                                            bookings: []
                                          };
                                        }
                                        dates[dateKey].bookings.push(booking);
                                        return dates;
                                      }, {} as Record<string, DateInfo>);
                                      
                                      const sortedDates = Object.entries(allBookingDates).sort(([, a], [, b]) => {
                                        const dateA = new Date(a.year, new Date(`${a.month} 1`).getMonth(), a.day);
                                        const dateB = new Date(b.year, new Date(`${b.month} 1`).getMonth(), b.day);
                                        return dateA.getTime() - dateB.getTime();
                                      });
                                      
                                      if (sortedDates.length === 0) {
                                        return <div className="p-4 pl-20 text-sm text-muted-foreground">No bookings for this departure</div>;
                                      }
                                      
                                      return (
                                        <div>
                                          {sortedDates.map(([dateKey, dateInfo]: [string, DateInfo]) => {
                                            const expandKey = `${depKey}-${dateKey}`;
                                            const isDateExpanded = expandedDates.has(expandKey);
                                            const dateBookings = dateInfo.bookings.filter((b: any) => filteredBookings.includes(b));
                                            
                                            if (dateBookings.length === 0 && (searchQuery || startDate || endDate)) return null;
                                            
                                            return (
                                              <div key={expandKey} className="border-b border-border/20 last:border-0">
                                                <div className="flex items-center justify-between p-3 pl-20 hover:bg-muted/20">
                                                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleDate(expandKey)}>
                                                    {isDateExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                      <span className="font-medium">{dateInfo.month} {dateInfo.day}, {dateInfo.year}</span>
                                                      <span className="ml-2 text-xs text-muted-foreground">
                                                        {dateBookings.length} {dateBookings.length === 1 ? 'booking' : 'bookings'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  {dateBookings.length > 0 && (
                                                    <Button size="sm" variant="outline" onClick={(e) => {
                                                      e.stopPropagation();
                                                      const csv = [
                                                        ['Booking ID', 'Customer', 'Email', 'Phone', 'Participant Name', 'Participant Age', 'Participant Gender', 'Participant Phone', 'Participant Email', 'Emergency Contact Name', 'Emergency Contact Phone', 'Emergency Contact Relationship', 'Medical Conditions', 'Dietary Restrictions', 'Transport', 'Amount', 'Status', 'Payment'].join(','),
                                                        ...dateBookings.flatMap((b: Booking) => 
                                                          b.participants.map((participant, index) => [
                                                            index === 0 ? b.bookingId : '',
                                                            index === 0 ? b.userId.name : '',
                                                            index === 0 ? b.userId.email : '',
                                                            index === 0 ? (b.userId.phone || '') : '',
                                                            participant.name || '',
                                                            participant.age || '',
                                                            participant.gender || '',
                                                            participant.phone || '',
                                                            participant.email || '',
                                                            participant.emergencyContact?.name || '',
                                                            participant.emergencyContact?.phone || '',
                                                            participant.emergencyContact?.relationship || '',
                                                            participant.medicalConditions || '',
                                                            participant.dietaryRestrictions || '',
                                                            index === 0 ? (b.selectedTransportMode || '') : '',
                                                            index === 0 ? b.totalAmount : '',
                                                            index === 0 ? b.status : '',
                                                            index === 0 ? b.paymentInfo.paymentStatus : ''
                                                          ].join(','))
                                                        )
                                                      ].join('\n');
                                                      const blob = new Blob([csv], { type: 'text/csv' });
                                                      const url = window.URL.createObjectURL(blob);
                                                      const a = document.createElement('a');
                                                      a.href = url;
                                                      a.download = `${event.title.replace(/\s+/g, '-')}-${departure.label.replace(/\s+/g, '-')}-${dateInfo.month}-${dateInfo.day}-bookings.csv`;
                                                      a.click();
                                                      window.URL.revokeObjectURL(url);
                                                    }}>
                                                      <Download className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                </div>
                                                
                                                {isDateExpanded && (
                                                  <div className="bg-background/50 p-4 pl-28">
                                                    <div className="space-y-2">
                                                      {dateBookings.map((booking: Booking) => (
                                                        <div key={booking._id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                                                          <div className="flex-1">
                                                            <div className="font-medium">{booking.bookingId}</div>
                                                            <div className="text-sm text-muted-foreground">{booking.userId.name} • {booking.participants.length} participants</div>
                                                            <div className="text-xs text-muted-foreground">{booking.selectedTransportMode?.replace('_', ' ')}</div>
                                                          </div>
                                                          <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                              <div className="font-semibold text-primary">₹{booking.totalAmount.toLocaleString()}</div>
                                                              <Badge className={booking.paymentInfo.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                                {booking.paymentInfo.paymentStatus}
                                                              </Badge>
                                                            </div>
                                                            <Button size="sm" variant="outline" onClick={() => router.push(`/admin/bookings/${booking._id}`)}>
                                                              <Eye className="h-3 w-3" />
                                                            </Button>
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
