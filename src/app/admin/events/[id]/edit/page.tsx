'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { RegionSelect } from '@/components/ui/region-select';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountedPrice?: number;
  dates: string[];
  availableMonths: string[];
  availableDates: {
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
    transportOptions: {
      mode: 'AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS';
      price: number;
    }[];
    availableDates: {
      month: string;
      year: number;
      dates: number[];
      dateTransportModes?: Record<number, ('AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS')[]>;
      availableTransportModes?: ('AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS')[];
      availableSeats?: number;
      totalSeats?: number;
    }[];
    itinerary?: {
      day: number;
      title: string;
      location?: string;
      description: string;
      activities: string[];
      meals: string[];
      accommodation?: string;
      images?: string[];
    }[];
  }[];
  itinerary: {
    day: number;
    title: string;
    location?: string;
    description: string;
    activities: string[];
    meals: string[];
    accommodation?: string;
    images?: string[];
  }[];
  inclusions: string[];
  exclusions: string[];
  preparation: {
    physicalRequirements: string;
    medicalRequirements: string;
    experienceLevel: string;
    safetyGuidelines: string[];
    additionalNotes: string;
  };
  category: string;
  difficulty: string;
  images: string[];
  location: {
    name: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  region?: string;
  duration: string;
  maxParticipants: number;
  minParticipants: number;
  ageLimit: {
    min: number;
    max: number;
  };
  season: string[];
  tags: string[];
  highlights: string[];
  thingsToCarry: string[];
  guide: string;
  isActive: boolean;
  isFeatured: boolean;
}

const categories = ['TREKKING', 'CAMPING', 'WILDLIFE', 'CULTURAL', 'ADVENTURE', 'SPIRITUAL'];
const difficulties = ['EASY', 'MODERATE', 'DIFFICULT', 'EXTREME'];
const seasons = ['SPRING', 'SUMMER', 'MONSOON', 'AUTUMN', 'WINTER'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${params.id}`);
      if (!response.ok) {
        throw new Error('Event not found');
      }
      const data = await response.json();
      setEvent({
        ...data,
        // Normalize duration to string for free-text edit
        duration: (data.duration !== undefined && data.duration !== null) ? String(data.duration) : '',
        discountedPrice: data.discountedPrice || undefined,
        availableMonths: data.availableMonths || [],
        availableDates: Array.isArray(data.availableDates)
          ? data.availableDates
          : [],
        departures: Array.isArray((data as any).departures) ? (data as any).departures : []
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event data',
        variant: 'destructive',
      });
      router.push('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  // Departures & Transport options handlers
  const addDeparture = () => {
    setEvent(prev => prev ? {
      ...prev,
      departures: [...(prev.departures || []), {
        label: '',
        origin: '',
        destination: '',
        transportOptions: [{ mode: 'BUS', price: 0 }],
        availableDates: []
      }]
    } : prev);
  };

  const updateDepartureField = (index: number, field: keyof NonNullable<Event['departures']>[number], value: any) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      (newDepartures[index] as any)[field] = value;
      return { ...prev, departures: newDepartures };
    });
  };

  const removeDeparture = (index: number) => {
    setEvent(prev => prev ? {
      ...prev,
      departures: (prev.departures || []).filter((_, i) => i !== index)
    } : prev);
  };

  const addTransportOption = (depIndex: number) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      newDepartures[depIndex].transportOptions.push({ mode: 'BUS', price: 0 });
      return { ...prev, departures: newDepartures };
    });
  };

  const updateTransportOption = (depIndex: number, optIndex: number, field: 'mode' | 'price', value: any) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      (newDepartures[depIndex].transportOptions[optIndex] as any)[field] = value;
      return { ...prev, departures: newDepartures };
    });
  };

  const removeTransportOption = (depIndex: number, optIndex: number) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      newDepartures[depIndex].transportOptions = newDepartures[depIndex].transportOptions.filter((_, i) => i !== optIndex);
      return { ...prev, departures: newDepartures };
    });
  };

  const addDepartureDateEntry = (depIndex: number) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      newDepartures[depIndex].availableDates.push({ month: '', year: new Date().getFullYear(), dates: [], dateTransportModes: {}, availableTransportModes: [] });
      return { ...prev, departures: newDepartures };
    });
  };

  const updateDepartureDateEntry = (
    depIndex: number,
    dateIndex: number,
    field: keyof NonNullable<Event['departures']>[number]['availableDates'][number],
    value: any
  ) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      (newDepartures[depIndex].availableDates[dateIndex] as any)[field] = value;
      return { ...prev, departures: newDepartures };
    });
  };

  const removeDepartureDateEntry = (depIndex: number, dateIndex: number) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      newDepartures[depIndex].availableDates = newDepartures[depIndex].availableDates.filter((_, i) => i !== dateIndex);
      return { ...prev, departures: newDepartures };
    });
  };

  // Departure-specific itinerary handlers
  const handleDepartureItineraryChange = (
    depIndex: number,
    dayIndex: number,
    field: keyof NonNullable<Event['departures']>[number]['itinerary'][number],
    value: any
  ) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      const dep = newDepartures[depIndex];
      const itin = dep.itinerary || [];
      const newItin = [...itin];
      newItin[dayIndex] = { ...newItin[dayIndex], [field]: value } as any;
      newDepartures[depIndex] = { ...dep, itinerary: newItin };
      return { ...prev, departures: newDepartures };
    });
  };

  const addDepartureItineraryDay = (depIndex: number) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      const dep = newDepartures[depIndex];
      const itin = dep.itinerary || [];
      const nextDayNumber = itin.length === 0 ? 1 : Math.max(...itin.map(d => d.day)) + 1;
      const newDay = {
        day: nextDayNumber,
        title: '',
        location: '',
        description: '',
        activities: [],
        meals: [],
        accommodation: '',
        images: ['']
      };
      newDepartures[depIndex] = { ...dep, itinerary: [...itin, newDay] };
      return { ...prev, departures: newDepartures };
    });
  };

  const addDepartureDay0 = (depIndex: number) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      const dep = newDepartures[depIndex];
      const itin = dep.itinerary || [];
      if (itin.some(day => day.day === 0)) return prev;
      const newDay = {
        day: 0,
        title: '',
        location: '',
        description: '',
        activities: [],
        meals: [],
        accommodation: '',
        images: ['']
      };
      newDepartures[depIndex] = { ...dep, itinerary: [newDay, ...itin] };
      return { ...prev, departures: newDepartures };
    });
  };

  const removeDepartureItineraryDay = (depIndex: number, dayIndex: number) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      const dep = newDepartures[depIndex];
      const itin = dep.itinerary || [];
      const newItin = itin.filter((_, i) => i !== dayIndex);
      newDepartures[depIndex] = { ...dep, itinerary: newItin };
      return { ...prev, departures: newDepartures };
    });
  };

  const handleDepartureItineraryArrayChange = (
    depIndex: number,
    dayIndex: number,
    field: 'activities' | 'meals' | 'images',
    itemIndex: number,
    value: string
  ) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      const dep = newDepartures[depIndex];
      const itin = dep.itinerary || [];
      const newItin = [...itin];
      const arr = [...(newItin[dayIndex][field] || [])];
      arr[itemIndex] = value;
      newItin[dayIndex] = { ...newItin[dayIndex], [field]: arr } as any;
      newDepartures[depIndex] = { ...dep, itinerary: newItin };
      return { ...prev, departures: newDepartures };
    });
  };

  const addDepartureItineraryArrayItem = (
    depIndex: number,
    dayIndex: number,
    field: 'activities' | 'meals' | 'images'
  ) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      const dep = newDepartures[depIndex];
      const itin = dep.itinerary || [];
      const newItin = [...itin];
      const arr = [...(newItin[dayIndex][field] || [])];
      arr.push('');
      newItin[dayIndex] = { ...newItin[dayIndex], [field]: arr } as any;
      newDepartures[depIndex] = { ...dep, itinerary: newItin };
      return { ...prev, departures: newDepartures };
    });
  };

  const removeDepartureItineraryArrayItem = (
    depIndex: number,
    dayIndex: number,
    field: 'activities' | 'meals' | 'images',
    itemIndex: number
  ) => {
    setEvent(prev => {
      if (!prev) return prev;
      const newDepartures = [...(prev.departures || [])];
      const dep = newDepartures[depIndex];
      const itin = dep.itinerary || [];
      const newItin = [...itin];
      const arr = [...(newItin[dayIndex][field] || [])];
      const newArr = arr.filter((_, i) => i !== itemIndex);
      newItin[dayIndex] = { ...newItin[dayIndex], [field]: newArr } as any;
      newDepartures[depIndex] = { ...dep, itinerary: newItin };
      return { ...prev, departures: newDepartures };
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSaving(true);
    try {
      // Sanitize availableDates: include only fully valid entries
      const validAvailableDates = (event.availableDates || [])
        .filter((entry: any) => entry && typeof entry.month === 'string' && entry.month.trim() !== ''
          && entry.year !== undefined && entry.year !== null
          && Array.isArray(entry.dates) && entry.dates.length > 0
          && entry.dates.every((d: any) => Number.isFinite(Number(d))))
        .map((entry: any) => ({
          month: String(entry.month).trim(),
          year: Number(entry.year),
          dates: entry.dates.map((d: any) => Number(d)),
          location: entry.location ? String(entry.location) : undefined,
          availableSeats: entry.availableSeats !== undefined ? Number(entry.availableSeats) : undefined,
          totalSeats: entry.totalSeats !== undefined ? Number(entry.totalSeats) : undefined,
        }))
        .filter((e: any) => e.dates.length > 0);

      // Sanitize departures data including dateTransportModes
      const sanitizedDepartures = (event.departures || []).map((dep: any) => ({
        label: String(dep.label || '').trim(),
        origin: String(dep.origin || '').trim(),
        destination: String(dep.destination || '').trim(),
        transportOptions: Array.isArray(dep.transportOptions) 
          ? dep.transportOptions.filter((opt: any) => opt && opt.mode && opt.price !== undefined)
              .map((opt: any) => ({
                mode: String(opt.mode),
                price: Number(opt.price)
              }))
          : [],
        availableDates: Array.isArray(dep.availableDates)
          ? dep.availableDates
              .filter((entry: any) => entry && typeof entry.month === 'string' && entry.month.trim() !== ''
                && entry.year !== undefined && entry.year !== null
                && Array.isArray(entry.dates) && entry.dates.length > 0
                && entry.dates.every((d: any) => Number.isFinite(Number(d))))
              .map((entry: any) => ({
                month: String(entry.month).trim(),
                year: Number(entry.year),
                dates: entry.dates.map((d: any) => Number(d)),
                dateTransportModes: entry.dateTransportModes && typeof entry.dateTransportModes === 'object'
                  ? Object.fromEntries(
                      Object.entries(entry.dateTransportModes)
                        .filter(([k, v]: any) => Number.isFinite(Number(k)) && Array.isArray(v))
                        .map(([k, v]: any) => [
                          String(k),
                          (v as any[])
                            .map((m: any) => String(m))
                            .filter((m: string) => ['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].includes(m))
                        ])
                    )
                  : undefined,
                availableTransportModes: Array.isArray(entry.availableTransportModes)
                  ? entry.availableTransportModes
                      .map((m: any) => String(m))
                      .filter((m: string) => ['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].includes(m))
                  : undefined,
                availableSeats: entry.availableSeats !== undefined ? Number(entry.availableSeats) : undefined,
                totalSeats: entry.totalSeats !== undefined ? Number(entry.totalSeats) : undefined,
              }))
          : [],
        itinerary: Array.isArray(dep.itinerary)
          ? dep.itinerary
              .filter((item: any) => item && typeof item.title === 'string' && item.title.trim() !== '')
              .map((item: any, index: number) => ({
                day: Number(item.day ?? index + 1),
                title: String(item.title || `Day ${index + 1}`),
                location: item.location ? String(item.location) : undefined,
                description: String(item.description || 'No description provided'),
                activities: Array.isArray(item.activities) ? item.activities.map((a: any) => String(a)) : [],
                meals: Array.isArray(item.meals) ? item.meals.map((m: any) => String(m)) : [],
                accommodation: item.accommodation ? String(item.accommodation) : undefined,
                images: Array.isArray(item.images) ? item.images.map((img: any) => String(img)) : []
              }))
          : []
      }));

      // Sanitize event-level itinerary
      const sanitizedItinerary = event.itinerary
        .filter((item: any) => item && typeof item.title === 'string' && item.title.trim() !== '')
        .map((item: any, index: number) => ({
          day: Number(item.day ?? index + 1),
          title: String(item.title || `Day ${index + 1}`),
          location: item.location ? String(item.location) : undefined,
          description: String(item.description || 'No description provided'),
          activities: Array.isArray(item.activities) ? item.activities.map((a: any) => String(a)) : [],
          meals: Array.isArray(item.meals) ? item.meals.map((m: any) => String(m)) : [],
          accommodation: item.accommodation ? String(item.accommodation) : undefined,
          images: Array.isArray(item.images) ? item.images.filter((img: any) => img && String(img).trim()).map((img: any) => String(img)) : []
        }));

      // Minimal payload: update only fields changed on this form section
      const payload: any = {
        title: event.title,
        slug: event.slug,
        description: event.description,
        shortDescription: event.shortDescription,
        price: Number(event.price),
        discountedPrice: (typeof event.discountedPrice === 'number')
          ? event.discountedPrice
          : undefined,
        duration: String(event.duration).trim(),
        category: event.category,
        difficulty: event.difficulty,
        minParticipants: Number(event.minParticipants),
        maxParticipants: Number(event.maxParticipants),
        ageLimit: event.ageLimit,
        isActive: event.isActive,
        isFeatured: event.isFeatured,
        location: event.location,
        region: event.region,
        images: Array.isArray(event.images) ? event.images.filter((img: any) => img && String(img).trim()).map((img: any) => String(img)) : [],
        tags: event.tags,
        highlights: event.highlights,
        availableMonths: event.availableMonths,
        availableDates: validAvailableDates,
        departures: sanitizedDepartures,
        itinerary: sanitizedItinerary,
        inclusions: event.inclusions,
        exclusions: event.exclusions,
        thingsToCarry: event.thingsToCarry,
        preparation: event.preparation,
        updatedAt: new Date().toISOString()
      };

      console.log('IMAGES IN PAYLOAD:', payload.images);
      const response = await fetch(`/api/admin/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Non-JSON error response
      }

      if (!response.ok) {
        const details =
          (responseData && (responseData.details || responseData.error)) ||
          `HTTP ${response.status} ${response.statusText}`;
        throw new Error(typeof details === 'string' ? details : JSON.stringify(details));
      }

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      router.push('/admin/events');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update event',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = (field: string, value: any) => {
    if (!event) return;
    setEvent({ ...event, [field]: value });
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    if (!event) return;
    setEvent({
      ...event,
      [parent]: {
        ...(event as any)[parent],
        [field]: value
      }
    });
  };

  const addItineraryDay = () => {
    if (!event) return;
    const nextDayNumber = event.itinerary.length === 0 ? 1 : Math.max(...event.itinerary.map(d => d.day)) + 1;
    const newDay = {
      day: nextDayNumber,
      title: '',
      location: '',
      description: '',
      activities: [],
      meals: [],
      accommodation: '',
      images: ['']
    };
    setEvent({ ...event, itinerary: [...event.itinerary, newDay] });
  };

  const addDay0 = () => {
    if (!event) return;
    // Check if Day 0 already exists
    if (event.itinerary.some(day => day.day === 0)) {
      return;
    }
    
    const newDay = {
      day: 0,
      title: '',
      location: '',
      description: '',
      activities: [],
      meals: [],
      accommodation: '',
      images: ['']
    };
    setEvent({ ...event, itinerary: [newDay, ...event.itinerary] });
  };

  const removeItineraryDay = (index: number) => {
    if (!event) return;
    const newItinerary = event.itinerary.filter((_, i) => i !== index);
    setEvent({ ...event, itinerary: newItinerary });
  };

  const updateItineraryDay = (index: number, field: string, value: any) => {
    if (!event) return;
    const newItinerary = [...event.itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    setEvent({ ...event, itinerary: newItinerary });
  };

  const addArrayItem = (field: string, value: string) => {
    if (!event || !value.trim()) return;
    const currentArray = (event as any)[field] || [];
    setEvent({ ...event, [field]: [...currentArray, value.trim()] });
  };

  const removeArrayItem = (field: string, index: number) => {
    if (!event) return;
    const currentArray = (event as any)[field] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    setEvent({ ...event, [field]: newArray });
  };

  const handleItineraryArrayChange = (dayIndex: number, field: 'activities' | 'meals' | 'images', itemIndex: number, value: string) => {
    if (!event) return;
    const newItinerary = [...event.itinerary];
    const currentArray = [...(newItinerary[dayIndex][field] || [])];
    currentArray[itemIndex] = value;
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: currentArray };
    setEvent({ ...event, itinerary: newItinerary });
  };

  const addItineraryArrayItem = (dayIndex: number, field: 'activities' | 'meals' | 'images') => {
    if (!event) return;
    const newItinerary = [...event.itinerary];
    const currentArray = newItinerary[dayIndex][field] || [];
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: [...currentArray, ''] };
    setEvent({ ...event, itinerary: newItinerary });
  };

  const removeItineraryArrayItem = (dayIndex: number, field: 'activities' | 'meals' | 'images', itemIndex: number) => {
    if (!event) return;
    const newItinerary = [...event.itinerary];
    const currentArray = newItinerary[dayIndex][field] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== itemIndex);
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: newArray };
    setEvent({ ...event, itinerary: newItinerary });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Event not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/events')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
            <TabsTrigger value="preparation">Preparation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential event details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={event.title}
                      onChange={(e) => updateEvent('title', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={event.slug}
                      onChange={(e) => updateEvent('slug', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={event.shortDescription}
                    onChange={(e) => updateEvent('shortDescription', e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={event.description}
                    onChange={(e) => updateEvent('description', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={event.category} onValueChange={(value) => updateEvent('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={event.difficulty} onValueChange={(value) => updateEvent('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {diff}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={event.duration}
                      onChange={(e) => updateEvent('duration', e.target.value)}
                      placeholder="e.g., 5 Days 4 Nights, 1 Week, 3 days 2 nights"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      value={event.price || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value) || value < 0) {
                          updateEvent('price', 0);
                        } else {
                          updateEvent('price', value);
                        }
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                    <Input
                      id="discountedPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={event.discountedPrice || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value) || value < 0) {
                          updateEvent('discountedPrice', undefined);
                        } else {
                          updateEvent('discountedPrice', value);
                        }
                      }}
                      placeholder="Optional discounted price"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minParticipants">Min Participants</Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      value={event.minParticipants}
                      onChange={(e) => updateEvent('minParticipants', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={event.maxParticipants}
                      onChange={(e) => updateEvent('maxParticipants', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAge">Minimum Age</Label>
                    <Input
                      id="minAge"
                      type="number"
                      value={event.ageLimit.min}
                      onChange={(e) => updateNestedField('ageLimit', 'min', parseInt(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAge">Maximum Age</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      value={event.ageLimit.max}
                      onChange={(e) => updateNestedField('ageLimit', 'max', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={event.isActive}
                      onChange={(e) => updateEvent('isActive', e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={event.isFeatured}
                      onChange={(e) => updateEvent('isFeatured', e.target.checked)}
                    />
                    <span>Featured</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="locationName">Location Name</Label>
                      <Input
                        id="locationName"
                        value={event.location.name}
                        onChange={(e) => updateNestedField('location', 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationState">State</Label>
                      <Input
                        id="locationState"
                        value={event.location.state}
                        onChange={(e) => updateNestedField('location', 'state', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationCountry">Country</Label>
                      <Input
                        id="locationCountry"
                        value={event.location.country}
                        onChange={(e) => updateNestedField('location', 'country', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <RegionSelect
                      value={event.region || ''}
                      onChange={(value) => updateEvent('region', value)}
                      placeholder="Select or enter region"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Images</CardTitle>
                  <CardDescription>Add images for the event gallery (upload files or provide URLs)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.images.map((image, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <Label>Image {index + 1}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newImages = event.images.filter((_, i) => i !== index);
                            updateEvent('images', newImages.length > 0 ? newImages : ['']);
                          }}
                          disabled={event.images.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                      <ImageUpload
                        value={image}
                        onChange={(url) => {
                          const newImages = [...event.images];
                          newImages[index] = url;
                          updateEvent('images', newImages);
                        }}
                        placeholder="https://example.com/event-image.jpg"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateEvent('images', [...event.images, ''])}
                    className="w-full"
                  >
                    Add Another Image
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags & Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('tags', index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('tags', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Highlights</Label>
                    <div className="space-y-2">
                      {event.highlights.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={highlight}
                            onChange={(e) => {
                              const newHighlights = [...event.highlights];
                              newHighlights[index] = e.target.value;
                              updateEvent('highlights', newHighlights);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('highlights', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addArrayItem('highlights', 'New highlight')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Highlight
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <div className="space-y-6">
              {/* Available Months */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Months</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {months.map((month) => (
                      <label key={month} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(event?.availableMonths || []).includes(month)}
                          onChange={(e) => {
                            if (!event) return;
                            if (e.target.checked) {
                              setEvent(prev => prev ? {
                                ...prev,
                                availableMonths: [...(prev.availableMonths || []), month]
                              } : prev);
                            } else {
                              setEvent(prev => prev ? {
                                ...prev,
                                availableMonths: (prev.availableMonths || []).filter(m => m !== month)
                              } : prev);
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{month}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Available Dates */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Dates</CardTitle>
                  <CardDescription>Add specific dates when this event is available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(event?.availableDates || []).map((dateEntry, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Date Entry {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!event) return;
                            setEvent(prev => prev ? {
                              ...prev,
                              availableDates: (prev.availableDates || []).filter((_, i) => i !== index)
                            } : prev);
                          }}
                          
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`month-${index}`}>Month</Label>
                          <select
                            id={`month-${index}`}
                            value={dateEntry.month}
                            onChange={(e) => {
                              if (!event) return;
                              const newDates = [...(event.availableDates || [])];
                              newDates[index] = { ...newDates[index], month: e.target.value };
                              setEvent({ ...event, availableDates: newDates });
                            }}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select Month</option>
                            {months.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor={`year-${index}`}>Year</Label>
                          <Input
                            id={`year-${index}`}
                            type="number"
                            value={dateEntry.year || ''}
                            onChange={(e) => {
                              if (!event) return;
                              const newDates = [...(event.availableDates || [])];
                              newDates[index] = { ...newDates[index], year: parseInt(e.target.value) || new Date().getFullYear() };
                              setEvent({ ...event, availableDates: newDates });
                            }}
                            placeholder="2024"
                            min={new Date().getFullYear()}
                            max={new Date().getFullYear() + 5}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`location-${index}`}>Location (Optional)</Label>
                        <Input
                          id={`location-${index}`}
                          value={dateEntry.location || ''}
                          onChange={(e) => {
                            if (!event) return;
                            const newDates = [...(event.availableDates || [])];
                            newDates[index] = { ...newDates[index], location: e.target.value };
                            setEvent({ ...event, availableDates: newDates });
                          }}
                          placeholder="Starting location for this date"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`totalSeats-${index}`}>Total Seats</Label>
                          <Input
                            id={`totalSeats-${index}`}
                            type="number"
                            value={dateEntry.totalSeats || ''}
                            onChange={(e) => {
                              if (!event) return;
                              const newDates = [...(event.availableDates || [])];
                              const totalSeats = parseInt(e.target.value) || 0;
                              newDates[index] = { 
                                ...newDates[index], 
                                totalSeats,
                                availableSeats: newDates[index].availableSeats || totalSeats
                              };
                              setEvent({ ...event, availableDates: newDates });
                            }}
                            placeholder="20"
                            min={1}
                            max={100}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`availableSeats-${index}`}>Available Seats</Label>
                          <Input
                            id={`availableSeats-${index}`}
                            type="number"
                            value={dateEntry.availableSeats || ''}
                            onChange={(e) => {
                              if (!event) return;
                              const newDates = [...(event.availableDates || [])];
                              newDates[index] = { ...newDates[index], availableSeats: parseInt(e.target.value) || 0 };
                              setEvent({ ...event, availableDates: newDates });
                            }}
                            placeholder="20"
                            min={0}
                            max={dateEntry.totalSeats || 100}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Available Dates in {dateEntry.month || 'Selected Month'}</Label>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {dateEntry.dates.map((date, dateIndex) => (
                              <span key={dateIndex} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {date}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!event) return;
                                    const newDates = [...(event.availableDates || [])];
                                    newDates[index] = {
                                      ...newDates[index],
                                      dates: newDates[index].dates.filter((_, i) => i !== dateIndex)
                                    };
                                    setEvent({ ...event, availableDates: newDates });
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Add date (1-31)"
                              min="1"
                              max="31"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  const val = parseInt(input.value);
                                  if (!event) return;
                                  if (val >= 1 && val <= 31 && !dateEntry.dates.includes(val)) {
                                    const newDates = [...(event.availableDates || [])];
                                    const updatedDates = [...newDates[index].dates, val].sort((a, b) => a - b);
                                    newDates[index] = { ...newDates[index], dates: updatedDates };
                                    setEvent({ ...event, availableDates: newDates });
                                    input.value = '';
                                  }
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={(e) => {
                                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                const val = parseInt(input?.value || '');
                                if (!event || !input) return;
                                if (val >= 1 && val <= 31 && !dateEntry.dates.includes(val)) {
                                  const newDates = [...(event.availableDates || [])];
                                  const updatedDates = [...newDates[index].dates, val].sort((a, b) => a - b);
                                  newDates[index] = { ...newDates[index], dates: updatedDates };
                                  setEvent({ ...event, availableDates: newDates });
                                  input.value = '';
                                }
                              }}
                            >
                              Add Date
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!event) return;
                      setEvent(prev => prev ? {
                        ...prev,
                        availableDates: [
                          ...(prev.availableDates || []),
                          { 
                            month: '', 
                            year: new Date().getFullYear(), 
                            dates: [], 
                            location: '',
                            totalSeats: 20,
                            availableSeats: 20
                          }
                        ]
                      } : prev);
                    }}
                  >
                    Add Date Entry
                  </Button>
                </CardContent>
              </Card>

              {/* Departures & Transport Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Departures & Transport Options</CardTitle>
                  <CardDescription>Configure origins, transport pricing, and date availability per departure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(event?.departures || []).map((departure, depIndex) => (
                    <div key={depIndex} className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Label</Label>
                          <Input
                            value={departure.label}
                            onChange={(e) => updateDepartureField(depIndex, 'label', e.target.value)}
                            placeholder="e.g., Rajkot to Rajkot"
                          />
                        </div>
                        <div>
                          <Label>Origin</Label>
                          <Input
                            value={departure.origin}
                            onChange={(e) => updateDepartureField(depIndex, 'origin', e.target.value)}
                            placeholder="e.g., Rajkot"
                          />
                        </div>
                        <div>
                          <Label>Destination</Label>
                          <Input
                            value={departure.destination}
                            onChange={(e) => updateDepartureField(depIndex, 'destination', e.target.value)}
                            placeholder="e.g., Spiti"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button type="button" variant="outline" onClick={() => removeDeparture(depIndex)}>
                            Remove Departure
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Departures: Dates + Transport Options</Label>
                        <div className="grid md:grid-cols-2 gap-6 mt-2">
                          <div>
                            <Label className="text-sm font-medium">Transport Options</Label>
                            <div className="space-y-3 mt-2">
                          {departure.transportOptions.map((opt, optIndex) => (
                            <div key={optIndex} className="flex flex-col md:flex-row gap-2 items-end">
                              <div className="md:w-1/3">
                                <Label>Mode</Label>
                                <select
                                  value={opt.mode}
                                  onChange={(e) => updateTransportOption(depIndex, optIndex, 'mode', e.target.value)}
                                  className="w-full border rounded px-3 py-2"
                                >
                                  <option value="AC_TRAIN">AC Train</option>
                                  <option value="NON_AC_TRAIN">Non-AC Train</option>
                                  <option value="FLIGHT">Flight</option>
                                  <option value="BUS">Bus</option>
                                </select>
                              </div>
                              <div className="md:w-1/3">
                                <Label>Price (per person)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={opt.price}
                                  onChange={(e) => updateTransportOption(depIndex, optIndex, 'price', parseInt(e.target.value) || 0)}
                                  placeholder="Enter price"
                                />
                              </div>
                              <div>
                                <Button type="button" variant="outline" onClick={() => removeTransportOption(depIndex, optIndex)}>Remove</Button>
                              </div>
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => addTransportOption(depIndex)}>
                            Add Transport Option
                          </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Departure-specific Available Dates</Label>
                            <div className="space-y-4 mt-2">
                          {departure.availableDates.map((dateEntry, dateIndex) => (
                            <div key={dateIndex} className="border rounded p-3 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label>Month</Label>
                                  <Input
                                    value={dateEntry.month}
                                    onChange={(e) => updateDepartureDateEntry(depIndex, dateIndex, 'month', e.target.value)}
                                    placeholder="e.g., December"
                                  />
                                </div>
                                <div>
                                  <Label>Total Seats</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={dateEntry.totalSeats || 20}
                                    onChange={(e) => updateDepartureDateEntry(depIndex, dateIndex, 'totalSeats', parseInt(e.target.value) || 1)}
                                  />
                                </div>
                                <div>
                                  <Label>Available Seats</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={dateEntry.availableSeats || dateEntry.totalSeats || 20}
                                    onChange={(e) => updateDepartureDateEntry(depIndex, dateIndex, 'availableSeats', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Dates in {dateEntry.month || 'Selected Month'}</Label>
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {dateEntry.dates.map((d, dIndex) => (
                                      <span key={dIndex} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                        {d}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!event) return;
                                            const newDepartures = [...(event.departures || [])];
                                            const entry = newDepartures[depIndex].availableDates[dateIndex];
                                            entry.dates = entry.dates.filter((_, i) => i !== dIndex);
                                            const dtm = (entry.dateTransportModes || {}) as Record<number, any[]>;
                                            if (dtm && dtm[d] !== undefined) {
                                              delete dtm[d as any];
                                              entry.dateTransportModes = dtm as any;
                                            }
                                            newDepartures[depIndex].availableDates[dateIndex] = entry;
                                            setEvent({ ...event, departures: newDepartures });
                                          }}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Add date (1-31)"
                                      min="1"
                                      max="31"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const input = e.target as HTMLInputElement;
                                          const date = parseInt(input.value);
                                          if (!event) return;
                                          if (date >= 1 && date <= 31 && !dateEntry.dates.includes(date)) {
                                            const newDepartures = [...(event.departures || [])];
                                            newDepartures[depIndex].availableDates[dateIndex].dates = [...newDepartures[depIndex].availableDates[dateIndex].dates, date].sort((a, b) => a - b);
                                            setEvent({ ...event, departures: newDepartures });
                                            input.value = '';
                                          }
                                        }
                                      }}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={(e) => {
                                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                        const date = parseInt(input?.value || '');
                                        if (!event || !input) return;
                                        if (date >= 1 && date <= 31 && !dateEntry.dates.includes(date)) {
                                          const newDepartures = [...(event.departures || [])];
                                          newDepartures[depIndex].availableDates[dateIndex].dates = [...newDepartures[depIndex].availableDates[dateIndex].dates, date].sort((a, b) => a - b);
                                          setEvent({ ...event, departures: newDepartures });
                                          input.value = '';
                                        }
                                      }}
                                    >
                                      Add Date
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => removeDepartureDateEntry(depIndex, dateIndex)}
                                    >
                                      Remove Date Entry
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4">
                                <Label>Transport modes per date</Label>
                                <div className="space-y-3 mt-2">
                                  {dateEntry.dates.length === 0 && (
                                    <p className="text-xs text-muted-foreground">Add dates above to configure transport availability day-wise.</p>
                                  )}
                                  {dateEntry.dates.map((d) => {
                                    const dtm = (dateEntry.dateTransportModes || {}) as Record<number, any[]>;
                                    const selected = Array.isArray(dtm[d]) ? dtm[d] as any[] : [];
                                    return (
                                      <div key={d} className="flex flex-wrap items-center gap-3">
                                        <span className="text-sm font-medium w-16">{d}</span>
                                        {['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].map((mode) => {
                                          const checked = selected.includes(mode as any);
                                          return (
                                            <label key={mode} className="inline-flex items-center gap-2 border rounded px-3 py-2 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                  if (!event) return;
                                                  const newDepartures = [...(event.departures || [])];
                                                  const entry = newDepartures[depIndex].availableDates[dateIndex];
                                                  const cur = (entry.dateTransportModes || {}) as Record<number, any[]>;
                                                  const arr = Array.isArray(cur[d]) ? [...cur[d] as any[]] : [];
                                                  if (e.target.checked) {
                                                    if (!arr.includes(mode)) arr.push(mode as any);
                                                  } else {
                                                    const idx = arr.indexOf(mode as any);
                                                    if (idx !== -1) arr.splice(idx, 1);
                                                  }
                                                  cur[d as any] = arr as any[];
                                                  entry.dateTransportModes = cur as any;
                                                  newDepartures[depIndex].availableDates[dateIndex] = entry;
                                                  setEvent({ ...event, departures: newDepartures });
                                                }}
                                              />
                                              <span>{mode.replace('_',' ').replace('AC','AC')}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">If none selected for a date, all transport options are considered available.</p>
                              </div>
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => addDepartureDateEntry(depIndex)}>
                            Add Departure Date Entry
                          </Button>
                          {/* Route-specific Itinerary (optional) */}
                          <div className="mt-6 space-y-4">
                            <Label className="text-base font-semibold">Route-specific Itinerary (optional)</Label>
                            {(departure.itinerary || []).map((day, dayIndex) => (
                              <div key={dayIndex} className="border rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-semibold">
                                    {day.day === 0 ? 'Day 0 (Pre-arrival)' : `Day ${day.day}`}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeDepartureItineraryDay(depIndex, dayIndex)}
                                    disabled={(departure.itinerary || []).length <= 1}
                                  >
                                    Remove Day
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Title</Label>
                                    <Input
                                      value={day.title}
                                      onChange={(e) => handleDepartureItineraryChange(depIndex, dayIndex, 'title', e.target.value)}
                                      placeholder="Day title"
                                    />
                                  </div>
                                  <div>
                                    <Label>Location</Label>
                                    <Input
                                      value={day.location}
                                      onChange={(e) => handleDepartureItineraryChange(depIndex, dayIndex, 'location', e.target.value)}
                                      placeholder="Location for this day"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={day.description}
                                    onChange={(e) => handleDepartureItineraryChange(depIndex, dayIndex, 'description', e.target.value)}
                                    placeholder="Describe the day's activities"
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label>Activities</Label>
                                  {(day.activities || []).map((activity, actIndex) => (
                                    <div key={actIndex} className="flex gap-2 mt-2">
                                      <Input
                                        value={activity}
                                        onChange={(e) => handleDepartureItineraryArrayChange(depIndex, dayIndex, 'activities', actIndex, e.target.value)}
                                        placeholder="Activity description"
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeDepartureItineraryArrayItem(depIndex, dayIndex, 'activities', actIndex)}
                                        disabled={(day.activities || []).length <= 1}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addDepartureItineraryArrayItem(depIndex, dayIndex, 'activities')}
                                    className="mt-2"
                                    size="sm"
                                  >
                                    Add Activity
                                  </Button>
                                </div>

                                <div>
                                  <Label>Meals</Label>
                                  {(day.meals || []).map((meal, mealIndex) => (
                                    <div key={mealIndex} className="flex gap-2 mt-2">
                                      <Input
                                        value={meal}
                                        onChange={(e) => handleDepartureItineraryArrayChange(depIndex, dayIndex, 'meals', mealIndex, e.target.value)}
                                        placeholder="Meal description (e.g., Breakfast: Continental)"
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeDepartureItineraryArrayItem(depIndex, dayIndex, 'meals', mealIndex)}
                                        disabled={(day.meals || []).length <= 1}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addDepartureItineraryArrayItem(depIndex, dayIndex, 'meals')}
                                    className="mt-2"
                                    size="sm"
                                  >
                                    Add Meal
                                  </Button>
                                </div>

                                <div>
                                  <Label>Accommodation (Optional)</Label>
                                  <Input
                                    value={day.accommodation || ''}
                                    onChange={(e) => handleDepartureItineraryChange(depIndex, dayIndex, 'accommodation', e.target.value)}
                                    placeholder="Accommodation details for this day"
                                  />
                                </div>

                                <div>
                                  <Label>Day Images (Optional)</Label>
                                  <p className="text-sm text-gray-600 mb-2">Add images for this specific day</p>
                                  {(day.images || []).map((image, imgIndex) => (
                                    <div key={imgIndex} className="space-y-2 mt-4 p-4 border rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <Label>Image {imgIndex + 1}</Label>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeDepartureItineraryArrayItem(depIndex, dayIndex, 'images', imgIndex)}
                                          disabled={(day.images || []).length <= 1}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                      <ImageUpload
                                        value={image}
                                        onChange={(url) => handleDepartureItineraryArrayChange(depIndex, dayIndex, 'images', imgIndex, url)}
                                        placeholder="https://example.com/day-image.jpg"
                                      />
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addDepartureItineraryArrayItem(depIndex, dayIndex, 'images')}
                                    className="mt-2"
                                    size="sm"
                                  >
                                    Add Day Image
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addDepartureDay0(depIndex)}
                                className="flex-1"
                                disabled={(departure.itinerary || []).some(day => day.day === 0)}
                              >
                                Add Day 0 (Pre-arrival)
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addDepartureItineraryDay(depIndex)}
                                className="flex-1"
                              >
                                Add New Day
                              </Button>
                            </div>
                          </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addDeparture}>
                    Add Departure
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="itinerary">
            <Card>
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
                <CardDescription>Day-by-day event schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.itinerary.map((day, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {day.day === 0 ? 'Day 0 (Pre-arrival)' : `Day ${day.day}`}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItineraryDay(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={day.title}
                          onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={day.location || ''}
                          onChange={(e) => updateItineraryDay(index, 'location', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={day.description}
                        onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                        rows={2}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Activities</Label>
                        <Textarea
                          value={day.activities.join('\n')}
                          onChange={(e) => updateItineraryDay(index, 'activities', e.target.value.split('\n').filter(a => a.trim()))}
                          rows={2}
                          placeholder="Activity 1\nActivity 2"
                        />
                      </div>
                      <div>
                        <Label>Meals</Label>
                        <Textarea
                          value={day.meals.join('\n')}
                          onChange={(e) => updateItineraryDay(index, 'meals', e.target.value.split('\n').filter(m => m.trim()))}
                          rows={2}
                          placeholder="Breakfast\nLunch\nDinner"
                        />
                      </div>
                      <div>
                        <Label>Accommodation</Label>
                        <Input
                          value={day.accommodation || ''}
                          onChange={(e) => updateItineraryDay(index, 'accommodation', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Day Images (Optional)</Label>
                        <p className="text-sm text-gray-600 mb-2">Add images for this specific day</p>
                        {day.images?.map((image, imgIndex) => (
                          <div key={imgIndex} className="space-y-2 mt-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <Label>Image {imgIndex + 1}</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItineraryArrayItem(index, 'images', imgIndex)}
                                disabled={day.images?.length === 1}
                              >
                                Remove
                              </Button>
                            </div>
                            <ImageUpload
                              value={image}
                              onChange={(url) => handleItineraryArrayChange(index, 'images', imgIndex, url)}
                              placeholder="https://example.com/day-image.jpg"
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addItineraryArrayItem(index, 'images')}
                          className="mt-2"
                          size="sm"
                        >
                          Add Day Image
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDay0}
                    className="flex items-center gap-2 flex-1"
                    disabled={event.itinerary.some(day => day.day === 0)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Day 0 (Pre-arrival)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItineraryDay}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Day
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inclusions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inclusions</CardTitle>
                  <CardDescription>What's included in the event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={inclusion}
                        onChange={(e) => {
                          const newInclusions = [...event.inclusions];
                          newInclusions[index] = e.target.value;
                          updateEvent('inclusions', newInclusions);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('inclusions', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('inclusions', 'New inclusion')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Inclusion
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exclusions</CardTitle>
                  <CardDescription>What's not included in the event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={exclusion}
                        onChange={(e) => {
                          const newExclusions = [...event.exclusions];
                          newExclusions[index] = e.target.value;
                          updateEvent('exclusions', newExclusions);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('exclusions', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('exclusions', 'New exclusion')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Exclusion
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Things to Carry</CardTitle>
                  <CardDescription>Essential items participants should bring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.thingsToCarry.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newItems = [...event.thingsToCarry];
                          newItems[index] = e.target.value;
                          updateEvent('thingsToCarry', newItems);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('thingsToCarry', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('thingsToCarry', 'New item')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preparation">
            <Card>
              <CardHeader>
                <CardTitle>Preparation Guidelines</CardTitle>
                <CardDescription>Important information for participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="physicalRequirements">Physical Requirements</Label>
                  <Textarea
                    id="physicalRequirements"
                    value={event.preparation.physicalRequirements}
                    onChange={(e) => updateNestedField('preparation', 'physicalRequirements', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="medicalRequirements">Medical Requirements</Label>
                  <Textarea
                    id="medicalRequirements"
                    value={event.preparation.medicalRequirements}
                    onChange={(e) => updateNestedField('preparation', 'medicalRequirements', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Textarea
                    id="experienceLevel"
                    value={event.preparation.experienceLevel}
                    onChange={(e) => updateNestedField('preparation', 'experienceLevel', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Safety Guidelines</Label>
                  <div className="space-y-2">
                    {event.preparation.safetyGuidelines.map((guideline, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={guideline}
                          onChange={(e) => {
                            const newGuidelines = [...event.preparation.safetyGuidelines];
                            newGuidelines[index] = e.target.value;
                            updateNestedField('preparation', 'safetyGuidelines', newGuidelines);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newGuidelines = event.preparation.safetyGuidelines.filter((_, i) => i !== index);
                            updateNestedField('preparation', 'safetyGuidelines', newGuidelines);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newGuidelines = [...event.preparation.safetyGuidelines, 'New safety guideline'];
                        updateNestedField('preparation', 'safetyGuidelines', newGuidelines);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Guideline
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={event.preparation.additionalNotes}
                    onChange={(e) => updateNestedField('preparation', 'additionalNotes', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/events')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}