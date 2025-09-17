'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  IndianRupee,
  Plus,
  Minus,
  User,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  slug: string;
  price: number;
  location: {
    name: string;
    state: string;
    country: string;
  };
  duration: number;
  maxParticipants: number;
  minParticipants: number;
  dates: Date[];
  images: string[];
  description: string;
  inclusions: string[];
  exclusions: string[];
}

interface Participant {
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
}

export default function BookEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([{
    name: '',
    age: 18,
    gender: 'MALE',
    phone: '',
    email: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalConditions: '',
    dietaryRestrictions: ''
  }]);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(`/login?callbackUrl=/events/${params.slug}/book`);
      return;
    }
    fetchEvent();
  }, [session, status, params.slug, router]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.data);
        // Pre-fill user email if available
        if (session?.user?.email) {
          setParticipants(prev => [{
            ...prev[0],
            email: session.user.email || '',
            name: session.user.name || ''
          }]);
        }
      } else {
        toast({
          title: "Error",
          description: "Event not found",
          variant: "destructive"
        });
        router.push('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = () => {
    if (participants.length < (event?.maxParticipants || 10)) {
      setParticipants([...participants, {
        name: '',
        age: 18,
        gender: 'MALE',
        phone: '',
        email: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        medicalConditions: '',
        dietaryRestrictions: ''
      }]);
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: string, value: any) => {
    const updated = [...participants];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentValue = updated[index][parent as keyof Participant];
      if (typeof parentValue === 'object' && parentValue !== null) {
        updated[index] = {
          ...updated[index],
          [parent]: {
            ...parentValue,
            [child]: value
          }
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setParticipants(updated);
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return event.price * participants.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selectedDate) return;

    // Validation
    const isValid = participants.every(p => 
      p.name && p.age && p.phone && p.email && 
      p.emergencyContact.name && p.emergencyContact.phone && p.emergencyContact.relationship
    );

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for all participants",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: event._id,
          selectedDate,
          participants,
          totalAmount: calculateTotal(),
          specialRequests
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully. Redirecting to payment...",
        });
        // Redirect to payment page with booking ID
        router.push(`/booking/${data.data.bookingId}/payment`);
      } else {
        toast({
          title: "Booking Failed",
          description: data.error || "Failed to create booking",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Book Your Adventure</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {event.location.name}, {event.location.state}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {event.duration} {event.duration === 1 ? 'day' : 'days'}
              </div>
              <div className="flex items-center">
                <IndianRupee className="h-4 w-4 mr-1" />
                {event.price.toLocaleString()} per person
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Event Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="event-title">Event</Label>
                        <Input id="event-title" value={event.title} disabled />
                      </div>
                      <div>
                        <Label htmlFor="selected-date">Select Date *</Label>
                        <Select value={selectedDate} onValueChange={setSelectedDate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your preferred date" />
                          </SelectTrigger>
                          <SelectContent>
                            {event.dates.map((date, index) => (
                              <SelectItem key={index} value={new Date(date).toISOString()}>
                                {new Date(date).toLocaleDateString('en-IN', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Participants ({participants.length})</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addParticipant}
                          disabled={participants.length >= (event.maxParticipants || 10)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeParticipant(participants.length - 1)}
                          disabled={participants.length <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {participants.map((participant, index) => (
                        <div key={index} className="border border-border/50 rounded-lg p-4">
                          <h4 className="font-medium mb-4">Participant {index + 1}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`name-${index}`}>Full Name *</Label>
                              <Input
                                id={`name-${index}`}
                                value={participant.name}
                                onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                                placeholder="Enter full name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`age-${index}`}>Age *</Label>
                              <Input
                                id={`age-${index}`}
                                type="number"
                                min="1"
                                max="100"
                                value={participant.age}
                                onChange={(e) => updateParticipant(index, 'age', parseInt(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`gender-${index}`}>Gender *</Label>
                              <Select
                                value={participant.gender}
                                onValueChange={(value) => updateParticipant(index, 'gender', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MALE">Male</SelectItem>
                                  <SelectItem value="FEMALE">Female</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`phone-${index}`}>Phone Number *</Label>
                              <Input
                                id={`phone-${index}`}
                                value={participant.phone}
                                onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                                placeholder="+91 9876543210"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor={`email-${index}`}>Email Address *</Label>
                              <Input
                                id={`email-${index}`}
                                type="email"
                                value={participant.email}
                                onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                                placeholder="email@example.com"
                              />
                            </div>
                          </div>

                          <Separator className="my-4" />
                          
                          <h5 className="font-medium mb-3">Emergency Contact</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`emergency-name-${index}`}>Name *</Label>
                              <Input
                                id={`emergency-name-${index}`}
                                value={participant.emergencyContact.name}
                                onChange={(e) => updateParticipant(index, 'emergencyContact.name', e.target.value)}
                                placeholder="Emergency contact name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`emergency-phone-${index}`}>Phone *</Label>
                              <Input
                                id={`emergency-phone-${index}`}
                                value={participant.emergencyContact.phone}
                                onChange={(e) => updateParticipant(index, 'emergencyContact.phone', e.target.value)}
                                placeholder="+91 9876543210"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`emergency-relationship-${index}`}>Relationship *</Label>
                              <Input
                                id={`emergency-relationship-${index}`}
                                value={participant.emergencyContact.relationship}
                                onChange={(e) => updateParticipant(index, 'emergencyContact.relationship', e.target.value)}
                                placeholder="Father, Mother, Spouse, etc."
                              />
                            </div>
                          </div>

                          <Separator className="my-4" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`medical-${index}`}>Medical Conditions</Label>
                              <Textarea
                                id={`medical-${index}`}
                                value={participant.medicalConditions}
                                onChange={(e) => updateParticipant(index, 'medicalConditions', e.target.value)}
                                placeholder="Any medical conditions we should know about"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`dietary-${index}`}>Dietary Restrictions</Label>
                              <Textarea
                                id={`dietary-${index}`}
                                value={participant.dietaryRestrictions}
                                onChange={(e) => updateParticipant(index, 'dietaryRestrictions', e.target.value)}
                                placeholder="Any dietary restrictions or preferences"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Special Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requests or requirements for your trip"
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Event:</span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span className="font-medium">{participants.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per person:</span>
                      <span className="font-medium">₹{event.price.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Important Notes:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Payment is required to confirm booking</li>
                            <li>• Cancellation policy applies</li>
                            <li>• All participant details are mandatory</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSubmit}
                      disabled={!selectedDate || submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? 'Creating Booking...' : 'Proceed to Payment'}
                    </Button>
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