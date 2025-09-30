'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import { 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Download,
  Eye,
  Star,
  MessageSquare
} from 'lucide-react';

interface UserBooking {
  _id: string;
  bookingId: string;
  eventId: {
    _id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
  };
  participants: Array<{
    name: string;
    age: number;
    gender: string;
  }>;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentInfo: {
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
    paymentMethod: string;
    transactionId?: string;
  };
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/dashboard/bookings');
      return;
    }
    
    fetchUserBookings();
  }, [session, status, router]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      
      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'CANCELLED' } : booking
        ));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const downloadBookingReceipt = (booking: UserBooking) => {
    // Generate PDF receipt
    const receiptContent = `
      <html>
        <head>
          <title>Booking Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #333; }
            .subtitle { font-size: 16px; color: #666; margin-top: 5px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; }
            .participants { margin-top: 15px; }
            .participant { margin: 5px 0; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">AVID EXPLORES</div>
            <div class="subtitle">Booking Receipt</div>
          </div>
          
          <div class="section">
            <div><span class="label">Booking ID:</span> ${booking.bookingId}</div>
            <div><span class="label">Event:</span> ${booking.eventId.title}</div>
            <div><span class="label">Location:</span> ${booking.eventId.location}</div>
            <div><span class="label">Total Amount:</span> ₹${booking.totalAmount.toLocaleString()}</div>
            <div><span class="label">Status:</span> ${booking.status}</div>
            <div><span class="label">Payment Status:</span> ${booking.paymentInfo.paymentStatus}</div>
            <div><span class="label">Booking Date:</span> ${new Date(booking.createdAt).toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <div class="label">Participants (${booking.participants.length}):</div>
            <div class="participants">
              ${booking.participants.map((p, i) => `<div class="participant">${i + 1}. ${p.name} (${p.age} years, ${p.gender})</div>`).join('')}
            </div>
          </div>
          
          <div class="footer">
            Thank you for choosing Avid Explores!
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventId.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">
                My Bookings
              </h1>
              <p className="text-muted-foreground">
                View and manage your adventure bookings
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">
              My Bookings
            </h1>
            <p className="text-muted-foreground">
              View and manage your adventure bookings
            </p>
          </div>

          {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by booking ID, event name, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No bookings found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'ALL'
                    ? 'No bookings match your current filters.'
                    : "You haven't made any bookings yet."}
                </p>
                <Button onClick={() => router.push('/events')}>
                  Explore Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="card-adventure">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Image */}
                      <div className="lg:w-48 flex-shrink-0">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          {booking.eventId.images.length > 0 ? (
                            <img
                              src={booking.eventId.images[0]}
                              alt={booking.eventId.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Booking Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {booking.eventId.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Booking ID: {booking.bookingId}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.eventId.location}
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end space-y-2 mt-2 sm:mt-0">
                            <div className="flex space-x-2">
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <Badge className={getPaymentStatusColor(booking.paymentInfo.paymentStatus)}>
                                {booking.paymentInfo.paymentStatus}
                              </Badge>
                            </div>
                            <div className="text-lg font-semibold text-primary">
                              ₹{booking.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{booking.participants.length} participant{booking.participants.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>{booking.paymentInfo.paymentMethod}</span>
                          </div>
                        </div>
                        
                        {booking.specialRequests && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Special Requests:</p>
                            <p className="text-sm text-foreground">{booking.specialRequests}</p>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadBookingReceipt(booking)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download PDF Receipt
                          </Button>
                          
                          {booking.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/events/${booking.eventId._id}?review=true`)}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              Write Review
                            </Button>
                          )}
                          
                          {booking.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              Cancel Booking
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push('/contact')}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Contact Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}