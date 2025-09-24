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
  duration: number;
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
      console.log('Fetched event data:', data);
      console.log('Discounted price from API:', data.discountedPrice);
      setEvent({
        ...data,
        discountedPrice: data.discountedPrice || undefined,
        availableMonths: data.availableMonths || [],
        availableDates: Array.isArray(data.availableDates) && data.availableDates.length > 0
          ? data.availableDates
          : [{ month: '', year: new Date().getFullYear(), dates: [], location: '' }],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    console.log('Form submission - current event state:', { title: event.title });

    setSaving(true);
    try {
      const payload = {
        ...event,
        updatedAt: new Date().toISOString()
      };

      console.log('Sending payload:', { title: payload.title, price: payload.price, discountedPrice: payload.discountedPrice });
      const response = await fetch(`/api/admin/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const responseData = await response.json();
      console.log('API Response:', { title: responseData.title, price: responseData.price, discountedPrice: responseData.discountedPrice });

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      router.push('/admin/events');
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = (field: string, value: any) => {
    if (!event) return;
    console.log('updateEvent called:', { field, value });
    const newEvent = { ...event, [field]: value };
    console.log('updateEvent setting new state:', { field, value });
    setEvent(newEvent);
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
    const newDay = {
      day: event.itinerary.length + 1,
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

  const removeItineraryDay = (index: number) => {
    if (!event) return;
    const newItinerary = event.itinerary.filter((_, i) => i !== index);
    // Renumber days
    newItinerary.forEach((day, i) => {
      day.day = i + 1;
    });
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
    const currentArray = newItinerary[dayIndex][field] || [];
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
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={event.duration}
                      onChange={(e) => updateEvent('duration', parseInt(e.target.value))}
                      min="1"
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
                      step="0.01"
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
                      step="0.01"
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
                    <Input
                      id="region"
                      value={event.region || ''}
                      onChange={(e) => updateEvent('region', e.target.value)}
                      placeholder="e.g., North India, South India, Himalayas"
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
                          disabled={(event?.availableDates || []).length === 1}
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
                      <h4 className="font-semibold">Day {day.day}</h4>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItineraryDay}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Day
                </Button>
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