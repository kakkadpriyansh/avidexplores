'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  IndianRupee,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

interface Booking {
  _id: string;
  bookingId: string;
  eventId: {
    title: string;
    slug: string;
    price: number;
    location: {
      city: string;
      state: string;
    };
    duration: string;
  };
  date: string;
  participants: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
  }[];
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentInfo: {
    paymentMethod: string;
    paymentStatus: string;
  };
  specialRequests?: string;
  createdAt: string;
}

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchBooking();
    loadRazorpay();
  }, [session, status, params.bookingId, router]);

  const loadRazorpay = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load payment gateway",
        variant: "destructive"
      });
    };
    document.body.appendChild(script);
  };

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.data);
        
        // If already paid, redirect to confirmation
        if (data.data.paymentInfo.paymentStatus === 'SUCCESS') {
          router.push(`/booking/${params.bookingId}/confirmation`);
        }
      } else {
        toast({
          title: "Error",
          description: "Booking not found",
          variant: "destructive"
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking || !razorpayLoaded) return;

    setProcessing(true);

    try {
      // Create Razorpay order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          amount: booking.finalAmount
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Avid Explores',
        description: `Payment for ${booking.eventId.title}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                bookingId: booking.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast({
                title: "Payment Successful",
                description: "Your booking has been confirmed!"
              });
              router.push(`/booking/${booking.bookingId}/confirmation`);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was debited",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: booking.participants[0]?.phone || ''
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can retry payment anytime",
              variant: "destructive"
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground">Secure your adventure booking with our trusted payment gateway</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Booking Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-lg">{booking.eventId.title}</div>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.eventId.location.city}, {booking.eventId.location.state}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Booking ID:</span>
                        <div className="font-medium">{booking.bookingId}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <div className="font-medium">
                          {new Date(booking.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-medium">{booking.eventId.duration}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Participants:</span>
                        <div className="font-medium">{booking.participants.length}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-muted-foreground mb-2">Participants:</div>
                      <div className="space-y-2">
                        {booking.participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{participant.name}</span>
                            <Badge variant="outline">{participant.age} years</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {booking.specialRequests && (
                      <div>
                        <div className="text-muted-foreground mb-1">Special Requests:</div>
                        <div className="text-sm bg-muted/50 p-2 rounded">{booking.specialRequests}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Base Amount ({booking.participants.length} × ₹{booking.eventId.price.toLocaleString()}):</span>
                      <span>₹{booking.totalAmount.toLocaleString()}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">₹{booking.finalAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">Secure Payment</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Your payment is secured by Razorpay with 256-bit SSL encryption
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handlePayment}
                      disabled={processing || !razorpayLoaded}
                      className="w-full"
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <IndianRupee className="h-4 w-4 mr-2" />
                          Pay ₹{booking.finalAmount.toLocaleString()}
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        By proceeding, you agree to our terms and conditions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Payment Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    {booking.paymentInfo.paymentStatus === 'PENDING' ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">Payment Pending</div>
                          <div className="text-sm text-muted-foreground">Complete payment to confirm your booking</div>
                        </div>
                      </>
                    ) : booking.paymentInfo.paymentStatus === 'SUCCESS' ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Payment Successful</div>
                          <div className="text-sm text-muted-foreground">Your booking is confirmed</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">Payment Failed</div>
                          <div className="text-sm text-muted-foreground">Please retry payment</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}