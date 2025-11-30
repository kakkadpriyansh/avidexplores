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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Event {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  location: {
    name: string;
    state: string;
    country: string;
  };
  duration: number;
  maxParticipants: number;
  minParticipants: number;
  dates: Date[];
  availableDates?: {
    month: string;
    year: number;
    dates: number[];
    location?: string;
    availableSeats?: number;
    totalSeats?: number;
  }[];
  departures?: {
    label: string;
    origin: string;
    destination: string;
    price?: number;
    discountedPrice?: number;
    isSelected?: boolean;
    transportOptions: { mode: string; price: number }[];
    availableDates: {
      month: string;
      year: number;
      dates: number[];
      dateTransportModes?: Record<number, ('AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS')[]>;
      availableTransportModes?: ('AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS')[];
      availableSeats?: number;
      totalSeats?: number;
    }[];
  }[];
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
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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
  
  // Departure and transport state
  const [selectedDepartureIndex, setSelectedDepartureIndex] = useState<number | null>(null);
  const [selectedTransportIndex, setSelectedTransportIndex] = useState<number | null>(null);
  const [selectedDepartureMonth, setSelectedDepartureMonth] = useState<string | null>(null);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<number | null>(null);
  const [transportDialogOpen, setTransportDialogOpen] = useState(false);
  const [departureInitialized, setDepartureInitialized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(`/login?callbackUrl=/events/${params.slug}/book`);
      return;
    }
    fetchEvent();
  }, [session, status, params.slug, router]);

  // Read URL parameters and set selections - priority over auto-select
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const departureIndex = urlParams.get('departureIndex');
      const transportIndex = urlParams.get('transportIndex');
      const departureMonth = urlParams.get('departureMonth');
      const departureDate = urlParams.get('departureDate');

      if (departureIndex !== null) {
        setSelectedDepartureIndex(parseInt(departureIndex));
        setDepartureInitialized(true); // Prevent auto-select from overriding
      }
      if (transportIndex !== null) {
        setSelectedTransportIndex(parseInt(transportIndex));
      }
      if (departureMonth) {
        setSelectedDepartureMonth(departureMonth);
      }
      if (departureDate !== null) {
        setSelectedDepartureDate(parseInt(departureDate));
      }
    }
  }, []);

  // Auto-select departure only if no URL parameters were provided
  useEffect(() => {
    if (event?.departures && !departureInitialized) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUrlParams = urlParams.get('departureIndex') !== null;
      
      if (!hasUrlParams) {
        const selectedIndex = event.departures.findIndex(dep => dep.isSelected);
        if (selectedIndex !== -1) {
          setSelectedDepartureIndex(selectedIndex);
        }
      }
      setDepartureInitialized(true);
    }
  }, [event?.departures, departureInitialized]);

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
      if (parent === 'emergencyContact') {
        updated[index] = {
          ...updated[index],
          emergencyContact: {
            ...updated[index].emergencyContact,
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
    
    let basePrice = event.price;
    let transportPrice = 0;
    
    // If departure is selected, use departure-specific pricing
    if (selectedDepartureIndex !== null && event.departures?.[selectedDepartureIndex]) {
      const departure = event.departures[selectedDepartureIndex];
      const departurePrice = Number((departure as any).price || event.price);
      const departureDiscountedPrice = Number((departure as any).discountedPrice || 0);
      
      basePrice = (departureDiscountedPrice > 0 && departureDiscountedPrice < departurePrice) 
        ? departureDiscountedPrice 
        : departurePrice;
      
      // Add transport price if selected
      if (selectedTransportIndex !== null && departure.transportOptions?.[selectedTransportIndex]) {
        transportPrice = Number(departure.transportOptions[selectedTransportIndex].price || 0);
      }
    } else {
      // Fallback to event-level pricing
      basePrice = (event.discountedPrice && event.discountedPrice > 0 && event.discountedPrice < event.price) 
        ? event.discountedPrice 
        : event.price;
    }
    
    return (basePrice + transportPrice) * participants.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || selectedDepartureIndex === null || !selectedDepartureDate || selectedTransportIndex === null) return;

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
      const departure = event.departures[selectedDepartureIndex];
      const dateGroup = departure.availableDates?.find(d => d.month === selectedDepartureMonth);
      const year = dateGroup?.year || new Date().getFullYear();
      const bookingDate = new Date(`${selectedDepartureMonth} ${selectedDepartureDate}, ${year}`);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: event._id,
          selectedDate: bookingDate.toISOString(),
          selectedMonth: selectedDepartureMonth,
          selectedYear: year,
          selectedDeparture: departure.label,
          selectedTransportMode: departure.transportOptions[selectedTransportIndex].mode,
          participants,
          totalAmount: calculateTotal(),
          specialRequests
        })
      });

      const data = await response.json();
      console.log('Booking response:', data);

      if (response.ok) {
        setShowSuccessDialog(true);
      } else {
        console.error('Booking error:', data);
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
      
      <div className="container mx-auto px-4 py-8 pt-24">
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
                    <div>
                      <Label htmlFor="event-title">Event</Label>
                      <Input id="event-title" value={event.title} disabled />
                    </div>
                  </CardContent>
                </Card>

                {/* Departures & Transport Options */}
                {(event.departures && event.departures.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Departures & Transport Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedDepartureIndex !== null && event.departures[selectedDepartureIndex] && (
                          <div>
                            <Label>Selected Departure</Label>
                            <Input 
                              value={event.departures[selectedDepartureIndex].label?.trim() ? event.departures[selectedDepartureIndex].label : `${event.departures[selectedDepartureIndex].origin} → ${event.departures[selectedDepartureIndex].destination}`}
                              disabled 
                              className="text-foreground"
                            />
                          </div>
                        )}
                      </div>

                      {/* Transport selection modal */}
                      <Dialog open={transportDialogOpen} onOpenChange={setTransportDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select Transport</DialogTitle>
                            <DialogDescription>
                              {selectedDepartureIndex !== null && event.departures[selectedDepartureIndex]
                                ? `Choose a mode for ${event.departures[selectedDepartureIndex].label?.trim() ? event.departures[selectedDepartureIndex].label : `${event.departures[selectedDepartureIndex].origin} → ${event.departures[selectedDepartureIndex].destination}`}` +
                                  (selectedDepartureMonth && selectedDepartureDate !== null
                                    ? ` on ${selectedDepartureDate} ${selectedDepartureMonth.split('-')[0]} ${selectedDepartureMonth.split('-')[1]}`
                                    : '')
                                : 'Choose a transport mode'}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedDepartureIndex !== null && event.departures[selectedDepartureIndex] && (
                            (() => {
                              const dep = event.departures[selectedDepartureIndex];
                              let filteredOptions = dep.transportOptions || [];
                              if (selectedDepartureMonth && selectedDepartureDate !== null) {
                                const dateGroup = dep.availableDates?.find(g => g.month === selectedDepartureMonth);
                                const perDateModes = (dateGroup as any)?.dateTransportModes?.[selectedDepartureDate] as string[] | undefined;
                                const monthModes = (dateGroup as any)?.availableTransportModes as string[] | undefined;
                                const modes = Array.isArray(perDateModes) && perDateModes.length > 0
                                  ? perDateModes
                                  : (Array.isArray(monthModes) && monthModes.length > 0 ? monthModes : undefined);
                                if (Array.isArray(modes) && modes.length > 0) {
                                  const filtered = filteredOptions.filter(opt => modes.includes(opt.mode));
                                  // If no transport options match the configured modes, show all available options
                                  // This handles cases where dateTransportModes are configured but don't match transportOptions
                                  filteredOptions = filtered.length > 0 ? filtered : filteredOptions;
                                }
                              }
                              if (!filteredOptions || filteredOptions.length === 0) {
                                return (
                                  <p className="text-sm text-muted-foreground">No transport options available for the selected date.</p>
                                );
                              }
                              return (
                                <div className="flex flex-wrap gap-2">
                                  {filteredOptions.map((opt, tIdx) => (
                                    <button
                                      key={tIdx}
                                      type="button"
                                      onClick={() => {
                                        const idx = dep.transportOptions.findIndex(o => o.mode === opt.mode && o.price === opt.price);
                                        setSelectedTransportIndex(idx >= 0 ? idx : tIdx);
                                        setTransportDialogOpen(false);
                                      }}
                                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                                        dep.transportOptions[selectedTransportIndex || -1]?.mode === opt.mode && dep.transportOptions[selectedTransportIndex || -1]?.price === opt.price
                                          ? 'bg-primary text-primary-foreground border-primary'
                                          : 'bg-background text-muted-foreground hover:text-foreground border-border hover:border-primary/50'
                                      }`}
                                    >
                                      {opt.mode} · ₹{Number(opt.price || 0).toLocaleString()}
                                    </button>
                                  ))}
                                </div>
                              );
                            })()
                          )}
                        </DialogContent>
                      </Dialog>

                      {selectedDepartureIndex !== null && event.departures[selectedDepartureIndex] && (
                        <div className="space-y-4">
                          {selectedTransportIndex !== null && event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex] && (
                            <p className="text-xs text-muted-foreground">
                              Selected transport: {event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex].mode.replace('_', ' ')}
                              {' '}(+₹{Number(event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex].price || 0).toLocaleString()})
                            </p>
                          )}

                          <div className="space-y-4">
                            <div>
                              <Label>Select Month *</Label>
                              <Select
                                value={selectedDepartureMonth || ''}
                                onValueChange={(value) => {
                                  setSelectedDepartureMonth(value);
                                  setSelectedDepartureDate(null);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {event.departures[selectedDepartureIndex].availableDates?.map((dateGroup, dIdx) => (
                                    <SelectItem key={dIdx} value={dateGroup.month}>
                                      {dateGroup.month}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedDepartureMonth && (
                              <div>
                                <Label>Select Date *</Label>
                                <Select
                                  value={selectedDepartureDate?.toString() || ''}
                                  onValueChange={(value) => {
                                    setSelectedDepartureDate(parseInt(value));
                                    // Only open transport dialog if transport not already selected from URL
                                    if (selectedTransportIndex === null) {
                                      setTransportDialogOpen(true);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose date" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {event.departures[selectedDepartureIndex].availableDates
                                      ?.find(d => d.month === selectedDepartureMonth)
                                      ?.dates.map((date) => (
                                        <SelectItem key={date} value={date.toString()}>
                                          {date}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

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
                              <Select
                                value={participant.emergencyContact.relationship}
                                onValueChange={(value) => updateParticipant(index, 'emergencyContact.relationship', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="parents">Parents</SelectItem>
                                  <SelectItem value="self">Self</SelectItem>
                                  <SelectItem value="brother">Brother</SelectItem>
                                  <SelectItem value="sister">Sister</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
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
                              <Select
                                value={participant.dietaryRestrictions}
                                onValueChange={(value) => updateParticipant(index, 'dietaryRestrictions', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select dietary preference" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="jain">Jain</SelectItem>
                                  <SelectItem value="swaminarayan">Swaminarayan</SelectItem>
                                  <SelectItem value="regular">Regular</SelectItem>
                                </SelectContent>
                              </Select>
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
                    
                    {/* Selected Date */}
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span>Selected Date:</span>
                        <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {/* Selected Departure & Transport */}
                    {event.departures && selectedDepartureIndex !== null && event.departures[selectedDepartureIndex] && (
                      <>
                        <div className="flex justify-between">
                          <span>Departure:</span>
                          <span className="font-medium">{event.departures[selectedDepartureIndex].label}</span>
                        </div>
                        {selectedTransportIndex !== null && event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex] && (
                          <div className="flex justify-between">
                            <span>Transport:</span>
                            <span className="font-medium">
                              {event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex].mode.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span>Base price per person:</span>
                      <span className="font-medium">
                        {(() => {
                          if (selectedDepartureIndex !== null && event.departures?.[selectedDepartureIndex]) {
                            const departure = event.departures[selectedDepartureIndex];
                            const departurePrice = Number((departure as any).price || event.price);
                            const departureDiscountedPrice = Number((departure as any).discountedPrice || 0);
                            const hasDiscount = departureDiscountedPrice > 0 && departureDiscountedPrice < departurePrice;
                            
                            return (
                              <>
                                ₹{(hasDiscount ? departureDiscountedPrice : departurePrice).toLocaleString()}
                                {hasDiscount && (
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    ₹{departurePrice.toLocaleString()}
                                  </span>
                                )}
                              </>
                            );
                          } else {
                            return (
                              <>
                                ₹{(event.discountedPrice || event.price).toLocaleString()}
                                {event.discountedPrice && (
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    ₹{event.price.toLocaleString()}
                                  </span>
                                )}
                              </>
                            );
                          }
                        })()
                        }
                      </span>
                    </div>
                    
                    {/* Transport cost breakdown */}
                    {event.departures && selectedDepartureIndex !== null && selectedTransportIndex !== null && event.departures[selectedDepartureIndex] && event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex] && (
                      <div className="flex justify-between">
                        <span>Transport cost per person:</span>
                        <span className="font-medium">
                          ₹{event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex].price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <Separator />
                    <div className="space-y-2">
                      {selectedDepartureIndex !== null && event.departures?.[selectedDepartureIndex] && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Departure: {event.departures[selectedDepartureIndex].label}</div>
                          {selectedTransportIndex !== null && event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex] && (
                            <div>Transport: {event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex].mode.replace('_', ' ')} (+₹{Number(event.departures[selectedDepartureIndex].transportOptions[selectedTransportIndex].price || 0).toLocaleString()})</div>
                          )}
                          {selectedDepartureDate && selectedDepartureMonth && (
                            <div>Date: {selectedDepartureDate} {selectedDepartureMonth.split('-')[0]} {selectedDepartureMonth.split('-')[1]}</div>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
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

                    {/* Debug info */}
                    <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/30 rounded">
                      <div>Departure: {selectedDepartureIndex !== null ? 'Selected' : 'Not selected'}</div>
                      <div>Date: {selectedDepartureDate !== null ? selectedDepartureDate : 'Not selected'}</div>
                      <div>Transport: {selectedTransportIndex !== null ? 'Selected' : 'Not selected'}</div>
                      <div>Month: {selectedDepartureMonth || 'Not selected'}</div>
                    </div>
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={selectedDepartureIndex === null || !selectedDepartureDate || selectedTransportIndex === null || !selectedDepartureMonth || submitting}
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
      
      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Registration Done!</AlertDialogTitle>
            <AlertDialogDescription>
              Your booking has been successfully registered. Complete payment using Razorpay on the bookings page. 
              Your booking status will be updated automatically after successful payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessDialog(false);
              router.push('/bookings');
            }}>
              Proceed to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}