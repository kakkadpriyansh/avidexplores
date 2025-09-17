'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Eye, 
  Download,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  Mail
} from 'lucide-react';

interface Booking {
  _id: string;
  bookingId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  eventId: {
    _id: string;
    title: string;
    location: string;
    price: number;
  };
  participants: Array<{
    name: string;
    age: number;
    gender: string;
    emergencyContact: string;
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

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/bookings');
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    fetchBookings();
  }, [session, status, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: newStatus as any } : booking
        ));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const exportBookings = () => {
    const csvContent = [
      ['Booking ID', 'Customer Name', 'Email', 'Event', 'Participants', 'Amount', 'Status', 'Payment Status', 'Date'].join(','),
      ...filteredBookings.map(booking => [
        booking.bookingId,
        booking.userId.name,
        booking.userId.email,
        booking.eventId.title,
        booking.participants.length,
        booking.totalAmount,
        booking.status,
        booking.paymentInfo.paymentStatus,
        new Date(booking.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventId.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || booking.paymentInfo.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
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
      {/* Removed <Navigation /> */}
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-foreground mb-2">
                Booking Management
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage customer bookings
              </p>
            </div>
            <Button onClick={exportBookings} className="mt-4 sm:mt-0">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <Card className="card-adventure mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by booking ID, customer name, email, or event..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="ALL">All Payments</option>
                      <option value="SUCCESS">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No bookings found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                    ? 'No bookings match your current filters.'
                    : 'No bookings have been made yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking._id} className="card-adventure">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {booking.eventId.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Booking ID: {booking.bookingId}
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-2 sm:mt-0">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(booking.paymentInfo.paymentStatus)}>
                              {booking.paymentInfo.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <User className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium text-foreground">{booking.userId.name}</div>
                              <div>{booking.userId.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            {booking.eventId.location}
                          </div>
                          
                          <div className="flex items-center text-muted-foreground">
                            <User className="h-4 w-4 mr-2" />
                            {booking.participants.length} participant{booking.participants.length !== 1 ? 's' : ''}
                          </div>
                          
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center font-semibold text-primary">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ₹{booking.totalAmount.toLocaleString()}
                            </div>
                            {booking.paymentInfo.transactionId && (
                              <div className="text-xs text-muted-foreground">
                                TXN: {booking.paymentInfo.transactionId}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 lg:ml-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/bookings/${booking._id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        
                        {booking.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(booking._id, 'CONFIRMED')}
                          >
                            Confirm
                          </Button>
                        )}
                        
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(booking._id, 'COMPLETED')}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
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