'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { RegionSelect } from '@/components/ui/region-select';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  discountedPrice?: number;
  location: string;
  region?: string;
  duration: string;
  maxParticipants: number;
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'EXTREME';
  category: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: {
    day: number;
    title: string;
    location: string;
    description: string;
    activities: string[];
    meals: string[];
    accommodation?: string;
    images?: string[];
  }[];
  preparation: {
    physicalRequirements: string;
    medicalRequirements: string;
    experienceLevel: string;
    safetyGuidelines: string[];
    additionalNotes: string;
  };
  highlights: string[];
  thingsToCarry: string[];
  availableMonths: string[];
  availableDates: {
    month: string;
    year: number;
    dates: number[];
    location?: string;
    availableSeats?: number;
    totalSeats?: number;
  }[];
  departures: {
    label: string;
    origin: string;
    destination: string;
    transportOptions: {
      mode: 'AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS';
      price: number;
    }[];
    itinerary?: {
      day: number;
      title: string;
      location: string;
      description: string;
      activities: string[];
      meals: string[];
      accommodation?: string;
      images?: string[];
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
  }[];
  startDate: string;
  endDate: string;
  images: string[];
  status: 'DRAFT' | 'PUBLISHED';
}

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    discountedPrice: undefined,
    location: '',
    region: '',
    duration: '',
    maxParticipants: 20,
    difficulty: 'MODERATE',
    category: 'TREKKING',
    inclusions: [''],
    exclusions: [''],
    itinerary: [{ day: 1, title: '', location: '', description: '', activities: [''], meals: [''], accommodation: '', images: [''] }],
    preparation: {
      physicalRequirements: '',
      medicalRequirements: '',
      experienceLevel: '',
      safetyGuidelines: [''],
      additionalNotes: ''
    },
    highlights: [''],
    thingsToCarry: [''],
    availableMonths: [],
    availableDates: [],
    departures: [],
    startDate: '',
    endDate: '',
    images: [''],
    status: 'DRAFT'
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/events/create');
      return;
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUB_ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'inclusions' | 'exclusions' | 'images' | 'highlights' | 'thingsToCarry' | 'availableMonths', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'inclusions' | 'exclusions' | 'images' | 'highlights' | 'thingsToCarry' | 'availableMonths') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'inclusions' | 'exclusions' | 'images' | 'highlights' | 'thingsToCarry' | 'availableMonths', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handlePreparationArrayChange = (field: 'safetyGuidelines', index: number, value: string) => {
    const newArray = [...formData.preparation[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      preparation: { ...prev.preparation, [field]: newArray }
    }));
  };

  const addPreparationArrayItem = (field: 'safetyGuidelines') => {
    setFormData(prev => ({
      ...prev,
      preparation: { ...prev.preparation, [field]: [...prev.preparation[field], ''] }
    }));
  };

  const removePreparationArrayItem = (field: 'safetyGuidelines', index: number) => {
    const newArray = formData.preparation[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      preparation: { ...prev.preparation, [field]: newArray }
    }));
  };

  const handleItineraryChange = (index: number, field: keyof typeof formData.itinerary[0], value: string | number) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const addItineraryDay = () => {
    const nextDayNumber = formData.itinerary.length === 0 ? 1 : Math.max(...formData.itinerary.map(d => d.day)) + 1;
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { 
        day: nextDayNumber, 
        title: '', 
        location: '', 
        description: '', 
        activities: [''], 
        meals: [''], 
        accommodation: '',
        images: ['']
      }]
    }));
  };

  const addDay0 = () => {
    // Check if Day 0 already exists
    if (formData.itinerary.some(day => day.day === 0)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      itinerary: [{ 
        day: 0, 
        title: '', 
        location: '', 
        description: '', 
        activities: [''], 
        meals: [''], 
        accommodation: '',
        images: ['']
      }, ...prev.itinerary]
    }));
  };

  const removeItineraryDay = (index: number) => {
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const handleItineraryArrayChange = (dayIndex: number, field: 'activities' | 'meals' | 'images', itemIndex: number, value: string) => {
    const newItinerary = [...formData.itinerary];
    const newArray = [...newItinerary[dayIndex][field]];
    newArray[itemIndex] = value;
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: newArray };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const addItineraryArrayItem = (dayIndex: number, field: 'activities' | 'meals' | 'images') => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex] = {
      ...newItinerary[dayIndex],
      [field]: [...newItinerary[dayIndex][field], '']
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const removeItineraryArrayItem = (dayIndex: number, field: 'activities' | 'meals' | 'images', itemIndex: number) => {
    const newItinerary = [...formData.itinerary];
    const newArray = newItinerary[dayIndex][field].filter((_, i) => i !== itemIndex);
    newItinerary[dayIndex] = { ...newItinerary[dayIndex], [field]: newArray };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  // Departures & Transport options handlers
  const addDeparture = () => {
    setFormData(prev => ({
      ...prev,
      departures: [
        ...prev.departures,
        {
          label: '',
          origin: '',
          destination: '',
          transportOptions: [{ mode: 'BUS', price: 0 }],
          itinerary: [],
          availableDates: []
        }
      ]
    }));
  };

  const updateDepartureField = (index: number, field: keyof EventFormData['departures'][0], value: any) => {
    const newDepartures = [...formData.departures];
    (newDepartures[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const removeDeparture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      departures: prev.departures.filter((_, i) => i !== index)
    }));
  };

  const addTransportOption = (depIndex: number) => {
    const newDepartures = [...formData.departures];
    newDepartures[depIndex].transportOptions.push({ mode: 'BUS', price: 0 });
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const updateTransportOption = (depIndex: number, optIndex: number, field: 'mode' | 'price', value: any) => {
    const newDepartures = [...formData.departures];
    (newDepartures[depIndex].transportOptions[optIndex] as any)[field] = value;
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const removeTransportOption = (depIndex: number, optIndex: number) => {
    const newDepartures = [...formData.departures];
    newDepartures[depIndex].transportOptions = newDepartures[depIndex].transportOptions.filter((_, i) => i !== optIndex);
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const addDepartureDateEntry = (depIndex: number) => {
    const newDepartures = [...formData.departures];
    newDepartures[depIndex].availableDates.push({ month: '', year: new Date().getFullYear(), dates: [], dateTransportModes: {}, availableTransportModes: [] });
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const updateDepartureDateEntry = (depIndex: number, dateIndex: number, field: keyof EventFormData['departures'][0]['availableDates'][number], value: any) => {
    const newDepartures = [...formData.departures];
    (newDepartures[depIndex].availableDates[dateIndex] as any)[field] = value;
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const removeDepartureDateEntry = (depIndex: number, dateIndex: number) => {
    const newDepartures = [...formData.departures];
    newDepartures[depIndex].availableDates = newDepartures[depIndex].availableDates.filter((_, i) => i !== dateIndex);
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  // Departure-specific itinerary handlers
  const handleDepartureItineraryChange = (
    depIndex: number,
    dayIndex: number,
    field: keyof NonNullable<EventFormData['departures'][number]['itinerary']>[number],
    value: any
  ) => {
    const newDepartures = [...formData.departures];
    const dep = newDepartures[depIndex];
    const itin = dep.itinerary || [];
    const newItin = [...itin];
    newItin[dayIndex] = { ...newItin[dayIndex], [field]: value } as any;
    newDepartures[depIndex] = { ...dep, itinerary: newItin };
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const addDepartureItineraryDay = (depIndex: number) => {
    const newDepartures = [...formData.departures];
    const dep = newDepartures[depIndex];
    const itin = dep.itinerary || [];
    const nextDayNumber = itin.length === 0 ? 1 : Math.max(...itin.map(d => d.day)) + 1;
    const newItin = [
      ...itin,
      {
        day: nextDayNumber,
        title: '',
        location: '',
        description: '',
        activities: [''],
        meals: [''],
        accommodation: '',
        images: ['']
      }
    ];
    newDepartures[depIndex] = { ...dep, itinerary: newItin };
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const addDepartureDay0 = (depIndex: number) => {
    const newDepartures = [...formData.departures];
    const dep = newDepartures[depIndex];
    const itin = dep.itinerary || [];
    if (itin.some(d => d.day === 0)) return;
    const newItin = [
      {
        day: 0,
        title: '',
        location: '',
        description: '',
        activities: [''],
        meals: [''],
        accommodation: '',
        images: ['']
      },
      ...itin
    ];
    newDepartures[depIndex] = { ...dep, itinerary: newItin };
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const removeDepartureItineraryDay = (depIndex: number, dayIndex: number) => {
    const newDepartures = [...formData.departures];
    const dep = newDepartures[depIndex];
    const itin = dep.itinerary || [];
    const newItin = itin.filter((_, i) => i !== dayIndex);
    newDepartures[depIndex] = { ...dep, itinerary: newItin };
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const handleDepartureItineraryArrayChange = (
    depIndex: number,
    dayIndex: number,
    field: 'activities' | 'meals' | 'images',
    itemIndex: number,
    value: string
  ) => {
    const newDepartures = [...formData.departures];
    const dep = newDepartures[depIndex];
    const itin = dep.itinerary || [];
    const newItin = [...itin];
    const arr = [...(newItin[dayIndex][field] || [])];
    arr[itemIndex] = value;
    newItin[dayIndex] = { ...newItin[dayIndex], [field]: arr } as any;
    newDepartures[depIndex] = { ...dep, itinerary: newItin };
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const addDepartureItineraryArrayItem = (
    depIndex: number,
    dayIndex: number,
    field: 'activities' | 'meals' | 'images'
  ) => {
    const newDepartures = [...formData.departures];
    const dep = newDepartures[depIndex];
    const itin = dep.itinerary || [];
    const newItin = [...itin];
    const arr = [...(newItin[dayIndex][field] || [])];
    arr.push('');
    newItin[dayIndex] = { ...newItin[dayIndex], [field]: arr } as any;
    newDepartures[depIndex] = { ...dep, itinerary: newItin };
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const removeDepartureItineraryArrayItem = (
    depIndex: number,
    dayIndex: number,
    field: 'activities' | 'meals' | 'images',
    itemIndex: number
  ) => {
    const newDepartures = [...formData.departures];
    const dep = newDepartures[depIndex];
    const itin = dep.itinerary || [];
    const newItin = [...itin];
    const arr = (newItin[dayIndex][field] || []).filter((_, i) => i !== itemIndex);
    newItin[dayIndex] = { ...newItin[dayIndex], [field]: arr } as any;
    newDepartures[depIndex] = { ...dep, itinerary: newItin };
    setFormData(prev => ({ ...prev, departures: newDepartures }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setLoading(true);
    
    try {
      const slug = generateSlug(formData.title);
      // Sanitize departures data including dateTransportModes
      const sanitizedDepartures = (formData.departures || []).map((dep: any) => ({
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
                          Number(k),
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

      const eventData = {
        ...formData,
        slug,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        inclusions: formData.inclusions.filter(item => item.trim() !== ''),
        exclusions: formData.exclusions.filter(item => item.trim() !== ''),
        images: formData.images.filter(item => item.trim() !== ''),
        departures: sanitizedDepartures,
        createdBy: session?.user.id
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const result = await response.json();
        router.push('/admin/events');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN' && session.user.role !== 'SUB_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-product-sans font-bold text-foreground">
                  Create New Event
                </h1>
                <p className="text-muted-foreground">
                  Add a new adventure event to your platform
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Basic Information */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief description for event cards"
                    rows={2}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed event description"
                    rows={6}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Event location"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <RegionSelect
                      value={formData.region || ''}
                      onChange={(value) => handleInputChange('region', value)}
                      placeholder="Select or enter region"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 3 Days 2 Nights"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value) || value < 0) {
                          handleInputChange('price', 0);
                        } else {
                          handleInputChange('price', value);
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
                      value={formData.discountedPrice || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value) || value < 0) {
                          handleInputChange('discountedPrice', undefined);
                        } else {
                          handleInputChange('discountedPrice', value);
                        }
                      }}
                      placeholder="Optional discounted price"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', Number(e.target.value))}
                      placeholder="20"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level *</Label>
                    <select
                      id="difficulty"
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      required
                    >
                      <option value="EASY">Easy</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="DIFFICULT">Difficult</option>
                      <option value="EXTREME">Extreme</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Departures & Transport Options */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Departures & Transport Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.departures.map((departure, depIndex) => (
                  <div key={depIndex} className="border rounded p-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Label>Label</Label>
                        <Input
                          value={departure.label}
                          onChange={(e) => updateDepartureField(depIndex, 'label', e.target.value)}
                          placeholder="e.g., Rajkot to Rajkot"
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Origin</Label>
                        <Input
                          value={departure.origin}
                          onChange={(e) => updateDepartureField(depIndex, 'origin', e.target.value)}
                          placeholder="e.g., Rajkot"
                        />
                      </div>
                      <div className="flex-1">
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
                                          const newDepartures = [...formData.departures];
                                          const dtm = newDepartures[depIndex].availableDates[dateIndex].dateTransportModes || {} as Record<number, any[]>;
                                          newDepartures[depIndex].availableDates[dateIndex].dates = newDepartures[depIndex].availableDates[dateIndex].dates.filter((_, i) => i !== dIndex);
                                          if (dtm && dtm[d] !== undefined) {
                                            delete dtm[d as any];
                                            newDepartures[depIndex].availableDates[dateIndex].dateTransportModes = dtm as any;
                                          }
                                          setFormData(prev => ({ ...prev, departures: newDepartures }));
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
                                        if (date >= 1 && date <= 31 && !dateEntry.dates.includes(date)) {
                                          const newDepartures = [...formData.departures];
                                          newDepartures[depIndex].availableDates[dateIndex].dates = [...newDepartures[depIndex].availableDates[dateIndex].dates, date].sort((a, b) => a - b);
                                          // initialize dateTransportModes entry for this date
                                          const dtm = newDepartures[depIndex].availableDates[dateIndex].dateTransportModes || {} as Record<number, any[]>;
                                          if (dtm[date as any] === undefined) {
                                            dtm[date as any] = [] as any[];
                                          }
                                          newDepartures[depIndex].availableDates[dateIndex].dateTransportModes = dtm as any;
                                          setFormData(prev => ({ ...prev, departures: newDepartures }));
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
                                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                      const date = parseInt(input.value);
                                      if (date >= 1 && date <= 31 && !dateEntry.dates.includes(date)) {
                                        const newDepartures = [...formData.departures];
                                        newDepartures[depIndex].availableDates[dateIndex].dates = [...newDepartures[depIndex].availableDates[dateIndex].dates, date].sort((a, b) => a - b);
                                        const dtm = newDepartures[depIndex].availableDates[dateIndex].dateTransportModes || {} as Record<number, any[]>;
                                        if (dtm[date as any] === undefined) {
                                          dtm[date as any] = [] as any[];
                                        }
                                        newDepartures[depIndex].availableDates[dateIndex].dateTransportModes = dtm as any;
                                        setFormData(prev => ({ ...prev, departures: newDepartures }));
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
                                                  const newDepartures = [...formData.departures];
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
                                                  setFormData(prev => ({ ...prev, departures: newDepartures }));
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

            {/* Highlights */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Event Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={highlight}
                      onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                      placeholder="Enter event highlight"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('highlights', index)}
                      disabled={formData.highlights.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('highlights')}
                >
                  Add Highlight
                </Button>
              </CardContent>
            </Card>

            {/* Things to Carry */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Things to Carry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.thingsToCarry.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange('thingsToCarry', index, e.target.value)}
                      placeholder="Enter item to carry"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('thingsToCarry', index)}
                      disabled={formData.thingsToCarry.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('thingsToCarry')}
                >
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Preparation Guidelines */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Preparation Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="physicalRequirements">Physical Requirements</Label>
                  <Textarea
                    id="physicalRequirements"
                    value={formData.preparation.physicalRequirements}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preparation: { ...prev.preparation, physicalRequirements: e.target.value }
                    }))}
                    placeholder="Describe physical fitness requirements"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="medicalRequirements">Medical Requirements</Label>
                  <Textarea
                    id="medicalRequirements"
                    value={formData.preparation.medicalRequirements}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preparation: { ...prev.preparation, medicalRequirements: e.target.value }
                    }))}
                    placeholder="Describe any medical requirements or restrictions"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="experienceLevel">Experience Level Required</Label>
                  <Textarea
                    id="experienceLevel"
                    value={formData.preparation.experienceLevel}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preparation: { ...prev.preparation, experienceLevel: e.target.value }
                    }))}
                    placeholder="Describe required experience level"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label>Safety Guidelines</Label>
                  {formData.preparation.safetyGuidelines.map((guideline, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={guideline}
                        onChange={(e) => handlePreparationArrayChange('safetyGuidelines', index, e.target.value)}
                        placeholder="Enter safety guideline"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePreparationArrayItem('safetyGuidelines', index)}
                        disabled={formData.preparation.safetyGuidelines.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addPreparationArrayItem('safetyGuidelines')}
                    className="mt-2"
                  >
                    Add Safety Guideline
                  </Button>
                </div>
                
                <div>
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.preparation.additionalNotes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preparation: { ...prev.preparation, additionalNotes: e.target.value }
                    }))}
                    placeholder="Any additional preparation notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inclusions & Exclusions */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>What's Included & Excluded</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Inclusions</Label>
                  {formData.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={inclusion}
                        onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                        placeholder="What's included in the package"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('inclusions', index)}
                        disabled={formData.inclusions.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('inclusions')}
                    className="mt-2"
                  >
                    Add Inclusion
                  </Button>
                </div>
                
                <div>
                  <Label className="text-base font-semibold">Exclusions</Label>
                  {formData.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={exclusion}
                        onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                        placeholder="What's not included in the package"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('exclusions', index)}
                        disabled={formData.exclusions.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('exclusions')}
                    className="mt-2"
                  >
                    Add Exclusion
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Itinerary */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Detailed Itinerary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.itinerary.map((day, dayIndex) => (
                  <div key={dayIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">
                        {day.day === 0 ? 'Day 0 (Pre-arrival)' : `Day ${day.day}`}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItineraryDay(dayIndex)}
                        disabled={formData.itinerary.length === 1}
                      >
                        Remove Day
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={day.title}
                          onChange={(e) => handleItineraryChange(dayIndex, 'title', e.target.value)}
                          placeholder="Day title"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={day.location}
                          onChange={(e) => handleItineraryChange(dayIndex, 'location', e.target.value)}
                          placeholder="Location for this day"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={day.description}
                        onChange={(e) => handleItineraryChange(dayIndex, 'description', e.target.value)}
                        placeholder="Describe the day's activities"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Activities</Label>
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex gap-2 mt-2">
                          <Input
                            value={activity}
                            onChange={(e) => handleItineraryArrayChange(dayIndex, 'activities', actIndex, e.target.value)}
                            placeholder="Activity description"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItineraryArrayItem(dayIndex, 'activities', actIndex)}
                            disabled={day.activities.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addItineraryArrayItem(dayIndex, 'activities')}
                        className="mt-2"
                        size="sm"
                      >
                        Add Activity
                      </Button>
                    </div>
                    
                    <div>
                      <Label>Meals</Label>
                      {day.meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="flex gap-2 mt-2">
                          <Input
                            value={meal}
                            onChange={(e) => handleItineraryArrayChange(dayIndex, 'meals', mealIndex, e.target.value)}
                            placeholder="Meal description (e.g., Breakfast: Continental)"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItineraryArrayItem(dayIndex, 'meals', mealIndex)}
                            disabled={day.meals.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addItineraryArrayItem(dayIndex, 'meals')}
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
                        onChange={(e) => handleItineraryChange(dayIndex, 'accommodation', e.target.value)}
                        placeholder="Accommodation details for this day"
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
                              onClick={() => removeItineraryArrayItem(dayIndex, 'images', imgIndex)}
                              disabled={day.images?.length === 1}
                            >
                              Remove
                            </Button>
                          </div>
                          <ImageUpload
                            value={image}
                            onChange={(url) => handleItineraryArrayChange(dayIndex, 'images', imgIndex, url)}
                            placeholder="https://example.com/day-image.jpg"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addItineraryArrayItem(dayIndex, 'images')}
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
                    onClick={addDay0}
                    className="flex-1"
                    disabled={formData.itinerary.some(day => day.day === 0)}
                  >
                    Add Day 0 (Pre-arrival)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItineraryDay}
                    className="flex-1"
                  >
                    Add New Day
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Event Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Event Images</Label>
                  <p className="text-sm text-gray-600 mb-2">Add images for the event gallery (upload files or provide URLs)</p>
                  {formData.images.map((image, index) => (
                    <div key={index} className="space-y-2 mt-4 p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <Label>Image {index + 1}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('images', index)}
                          disabled={formData.images.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                      <ImageUpload
                        value={image}
                        onChange={(url) => handleArrayChange('images', index, url)}
                        placeholder="https://example.com/event-image.jpg"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('images')}
                    className="mt-2"
                  >
                    Add Another Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={loading || !formData.title || !formData.description}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading || !formData.title || !formData.description}
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish Event
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}