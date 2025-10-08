'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Clock,
  CreditCard,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit3,
  IndianRupee
} from 'lucide-react';

interface BookingDetails {
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
    description: string;
    location: string;
    price: number;
    duration: string;
    difficulty: string;
    maxParticipants: number;
  };
  date: string;
  selectedMonth?: string;
  selectedYear?: number;
  selectedDeparture?: string;
  selectedTransportMode?: string;
  participants: Array<{
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    emergencyContact: { name: string; phone: string; relationship: string };
    medicalConditions?: string;
    dietaryRestrictions?: string;
  }>;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  paymentInfo: {
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    paymentMethod: string;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    refundId?: string;
    refundAmount?: number;
    refundedAt?: string;
  };
  specialRequests?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailsPage({ params }: { params: { bookingId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

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
    
    fetchBookingDetails();
  }, [session, status, router, params.bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings/${params.bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
        setAdminNotes(data.booking.adminNotes || '');
      } else {
        router.push('/admin/bookings');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      router.push('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setBooking({ ...booking, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!booking) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes })
      });
      
      if (response.ok) {
        setBooking({ ...booking, adminNotes });
      }
    } catch (error) {
      console.error('Error updating admin notes:', error);
    } finally {
      setUpdating(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN' || !booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/bookings')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
            <div>
              <h1 className="text-3xl font-product-sans font-bold text-foreground">
                Booking Details
              </h1>
              <p className="text-muted-foreground">
                {booking.bookingId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Information */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {booking.eventId.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {booking.eventId.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{booking.eventId.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{booking.eventId.duration}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <IndianRupee className="h-4 w-4 mr-2" />
                      <span>₹{booking.eventId.price.toLocaleString()} per person</span>
                    </div>
                    {booking.selectedDeparture && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Departure: {booking.selectedDeparture}</span>
                      </div>
                    )}
                    {booking.selectedTransportMode && (
                      <div className="flex items-center text-muted-foreground">
                        <span>Transport: {booking.selectedTransportMode.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Badge variant="outline">
                      {booking.eventId.difficulty} Difficulty
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p className="text-foreground font-medium">{booking.userId.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p className="text-foreground">{booking.userId.email}</p>
                      </div>
                    </div>
                    {booking.userId.phone && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <p className="text-foreground">{booking.userId.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Participants ({booking.participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {booking.participants.map((participant, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                            <p className="text-foreground font-medium">{participant.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                            <p className="text-foreground">{participant.age} years</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                            <p className="text-foreground">{participant.gender}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                            <p className="text-foreground">{participant.phone}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                            <p className="text-foreground">{participant.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                            <p className="text-foreground">
                              {participant.emergencyContact.name} - {participant.emergencyContact.phone} ({participant.emergencyContact.relationship})
                            </p>
                          </div>
                        </div>
                        {(participant.medicalConditions || participant.dietaryRestrictions) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                            {participant.medicalConditions && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Medical Conditions</Label>
                                <p className="text-foreground text-sm">{participant.medicalConditions}</p>
                              </div>
                            )}
                            {participant.dietaryRestrictions && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Dietary Restrictions</Label>
                                <p className="text-foreground text-sm">{participant.dietaryRestrictions}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              {booking.specialRequests && (
                <Card className="card-adventure">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Special Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">{booking.specialRequests}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Actions */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle>Status & Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Booking Status</span>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Payment Status</span>
                      <Badge className={getPaymentStatusColor(booking.paymentInfo.paymentStatus)}>
                        <CreditCard className="h-3 w-3 mr-1" />
                        {booking.paymentInfo.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    {booking.status === 'PENDING' && (
                      <Button
                        onClick={() => handleStatusChange('CONFIRMED')}
                        disabled={updating}
                        className="w-full"
                      >
                        Confirm Booking
                      </Button>
                    )}
                    
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        onClick={() => handleStatusChange('COMPLETED')}
                        disabled={updating}
                        variant="outline"
                        className="w-full"
                      >
                        Mark as Completed
                      </Button>
                    )}
                    
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Button
                        onClick={() => handleStatusChange('CANCELLED')}
                        disabled={updating}
                        variant="destructive"
                        className="w-full"
                      >
                        Cancel Booking
                      </Button>
                    )}
                    
                    {booking.paymentInfo.paymentStatus === 'SUCCESS' && booking.status !== 'REFUNDED' && (
                      <Button
                        onClick={() => handleStatusChange('REFUNDED')}
                        disabled={updating}
                        variant="outline"
                        className="w-full"
                      >
                        Process Refund
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="font-semibold text-primary text-lg">
                      ₹{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm text-foreground">{booking.paymentInfo.paymentMethod}</span>
                  </div>
                  
                  {booking.paymentInfo.transactionId && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Transaction ID</span>
                      <p className="text-xs text-foreground font-mono bg-muted p-2 rounded">
                        {booking.paymentInfo.transactionId}
                      </p>
                    </div>
                  )}
                  
                  {booking.paymentInfo.razorpayOrderId && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Razorpay Order ID</span>
                      <p className="text-xs text-foreground font-mono bg-muted p-2 rounded">
                        {booking.paymentInfo.razorpayOrderId}
                      </p>
                    </div>
                  )}
                  
                  {booking.paymentInfo.refundId && (
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Refund ID</span>
                      <p className="text-xs text-foreground font-mono bg-muted p-2 rounded">
                        {booking.paymentInfo.refundId}
                      </p>
                    </div>
                  )}
                  
                  {booking.paymentInfo.refundAmount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Refund Amount</span>
                      <span className="text-sm font-semibold text-red-600">
                        ₹{booking.paymentInfo.refundAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Timeline */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm text-foreground">
                      {new Date(booking.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm text-foreground">
                      {new Date(booking.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              {/* <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit3 className="h-5 w-5 mr-2" />
                    Admin Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add internal notes about this booking..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={handleNotesUpdate}
                    disabled={updating || adminNotes === (booking.adminNotes || '')}
                    size="sm"
                    className="w-full"
                  >
                    Update Notes
                  </Button>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}