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
import { useToast } from '@/hooks/use-toast';
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
  MessageSquare,
  CreditCard
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const { toast } = useToast();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

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

  const handleRazorpayPayment = async (booking: UserBooking) => {
    try {
      setProcessingPayment(booking._id);
      
      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          amount: booking.totalAmount
        })
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }
      
      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RiJUS1wq4Lm1iA',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Avid Explores',
        description: `Payment for ${booking.eventId.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.bookingId
              })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.success) {
              toast({
                title: "Payment Successful!",
                description: "Your booking has been confirmed.",
              });
              
              // Refresh bookings
              fetchUserBookings();
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted.",
              variant: "destructive"
            });
          } finally {
            setProcessingPayment(null);
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: ''
        },
        theme: {
          color: '#ef4444'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(null);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive"
      });
      setProcessingPayment(null);
    }
  };

  const downloadBookingReceipt = (booking: UserBooking) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${booking.bookingId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; padding: 40px; background: #fff; color: #000; }
            .invoice { max-width: 800px; margin: 0 auto; background: white; }
            .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 30px; border-bottom: 3px solid #ef4444; margin-bottom: 30px; }
            .logo-section { display: flex; align-items: center; gap: 10px; }
            .logo { height: 50px; }
            .company-name { height: 35px; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { font-size: 32px; color: #ef4444; margin-bottom: 5px; }
            .invoice-title p { color: #666; font-size: 14px; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-box { flex: 1; }
            .info-box h3 { color: #ef4444; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
            .info-box p { color: #333; font-size: 13px; line-height: 1.6; }
            .booking-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #ef4444; }
            .booking-details h3 { color: #ef4444; margin-bottom: 15px; font-size: 16px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #666; font-size: 13px; }
            .detail-value { color: #000; font-weight: 600; font-size: 13px; }
            .participants-section { margin-bottom: 30px; }
            .participants-section h3 { color: #ef4444; margin-bottom: 15px; font-size: 16px; }
            .participant-card { background: #fff; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
            .participant-card h4 { color: #000; margin-bottom: 8px; font-size: 14px; }
            .participant-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #666; }
            .amount-section { background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .amount-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; }
            .amount-total { border-top: 2px solid #ef4444; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: bold; color: #ef4444; }
            .payment-status { display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-top: 10px; }
            .status-success { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .footer { text-align: center; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #666; font-size: 12px; }
            .footer p { margin: 5px 0; }
            .footer strong { color: #ef4444; }
            @media print {
              body { padding: 20px; }
              .invoice { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="logo-section">
                <img src="/logo/Avid Red Black.png" alt="Avid Explores" class="logo" />
                <img src="/logo/Avid name black.png" alt="Avid Explores" class="company-name" />
              </div>
              <div class="invoice-title">
                <h1>INVOICE</h1>
                <p>Booking ID: ${booking.bookingId}</p>
              </div>
            </div>

            <div class="info-section">
              <div class="info-box">
                <h3>From</h3>
                <p><strong>Avid Explorers</strong><br/>
                Email: info@avidexplorers.in<br/>
                Phone: +91 88665 52400</p>
              </div>
              <div class="info-box" style="text-align: right;">
                <h3>Invoice Details</h3>
                <p><strong>Date:</strong> ${new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
                <strong>Status:</strong> ${booking.status}<br/>
                <strong>Payment:</strong> ${booking.paymentInfo.paymentStatus}</p>
              </div>
            </div>

            <div class="booking-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Event Name</span>
                <span class="detail-value">${booking.eventId.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location</span>
                <span class="detail-value">${booking.eventId.location}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Participants</span>
                <span class="detail-value">${booking.participants.length}</span>
              </div>
              ${booking.paymentInfo.transactionId ? `
              <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value">${booking.paymentInfo.transactionId}</span>
              </div>` : ''}
            </div>

            <div class="participants-section">
              <h3>Participant Details</h3>
              ${booking.participants.map((p, i) => `
                <div class="participant-card">
                  <h4>${i + 1}. ${p.name}</h4>
                  <div class="participant-info">
                    <span>Age: ${p.age} years</span>
                    <span>Gender: ${p.gender}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="amount-section">
              <div class="amount-row">
                <span>Base Amount (${booking.participants.length} × ₹${(booking.totalAmount / booking.participants.length).toLocaleString('en-IN')})</span>
                <span>₹${booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div class="amount-row amount-total">
                <span>Total Amount</span>
                <span>₹${booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span class="payment-status ${booking.paymentInfo.paymentStatus === 'SUCCESS' ? 'status-success' : 'status-pending'}">
                  ${booking.paymentInfo.paymentStatus === 'SUCCESS' ? '✓ PAID' : 'PENDING PAYMENT'}
                </span>
                ${booking.paymentInfo.paymentMethod && booking.paymentInfo.paymentMethod !== 'PENDING' ? `
                <span style="margin-left: 10px; color: #666; font-size: 12px;">via ${booking.paymentInfo.paymentMethod}</span>
                ` : ''}
              </div>
            </div>

            ${booking.specialRequests ? `
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
              <h3 style="color: #ef4444; margin-bottom: 10px; font-size: 14px;">Special Requests</h3>
              <p style="color: #666; font-size: 13px;">${booking.specialRequests}</p>
            </div>
            ` : ''}

            <div class="footer">
              <p><strong>Thank you for choosing Avid Explorers!</strong></p>
              <p>For any queries, contact us at info@avidexplorers.in</p>
              <p style="margin-top: 15px; font-size: 11px;">This is a computer-generated invoice and does not require a signature.</p>
            </div>
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
      }, 500);
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
                          {booking.paymentInfo.paymentMethod && booking.paymentInfo.paymentMethod !== 'PENDING' && (
                            <div className="flex items-center text-muted-foreground">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>{booking.paymentInfo.paymentMethod}</span>
                            </div>
                          )}
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
                          
                          {booking.status === 'PENDING' && booking.paymentInfo.paymentStatus === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleRazorpayPayment(booking)}
                              disabled={processingPayment === booking._id}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {processingPayment === booking._id ? 'Processing...' : 'Pay with Razorpay'}
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