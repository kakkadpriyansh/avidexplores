'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/ui/image-upload';
import { RegionSelect } from '@/components/ui/region-select';
import { ArrowLeft, Save, Eye, Plus, Trash2 } from 'lucide-react';
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
  minParticipants: number;
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
  startDate: string;
  endDate: string;
  images: string[];
  status: 'DRAFT' | 'PUBLISHED';
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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
    minParticipants: 1,
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
    availableDates: [{ month: '', year: new Date().getFullYear(), dates: [], location: '', totalSeats: 20, availableSeats: 20 }],
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
    if (session.user.role !== 'ADMIN') {
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

  const handleSubmit = async (isDraft: boolean = false) => {
    setLoading(true);
    
    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
      const eventData = {
        ...formData,
        slug,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        inclusions: formData.inclusions.filter(item => item.trim() !== ''),
        exclusions: formData.exclusions.filter(item => item.trim() !== ''),
        images: formData.images.filter(item => item.trim() !== ''),
        createdBy: session?.user.id
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
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

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Create New Event</h1>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
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
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TREKKING">TREKKING</SelectItem>
                            <SelectItem value="CAMPING">CAMPING</SelectItem>
                            <SelectItem value="WILDLIFE">WILDLIFE</SelectItem>
                            <SelectItem value="CULTURAL">CULTURAL</SelectItem>
                            <SelectItem value="ADVENTURE">ADVENTURE</SelectItem>
                            <SelectItem value="SPIRITUAL">SPIRITUAL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EASY">EASY</SelectItem>
                            <SelectItem value="MODERATE">MODERATE</SelectItem>
                            <SelectItem value="DIFFICULT">DIFFICULT</SelectItem>
                            <SelectItem value="EXTREME">EXTREME</SelectItem>
                          </SelectContent>
                        </Select>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
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
                          value={formData.discountedPrice || ''}
                          onChange={(e) => handleInputChange('discountedPrice', parseFloat(e.target.value) || undefined)}
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
                          value={formData.minParticipants}
                          onChange={(e) => handleInputChange('minParticipants', parseInt(e.target.value))}
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxParticipants">Max Participants</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          value={formData.maxParticipants}
                          onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Images</CardTitle>
                      <CardDescription>Add images for the event gallery</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="space-y-2 p-4 border rounded-lg">
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
                        className="w-full"
                      >
                        Add Another Image
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {formData.highlights.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={highlight}
                            onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                            placeholder="Enter event highlight"
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
                        onClick={() => addArrayItem('highlights')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Highlight
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Things to Carry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {formData.thingsToCarry.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => handleArrayChange('thingsToCarry', index, e.target.value)}
                            placeholder="Enter item to carry"
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
                        onClick={() => addArrayItem('thingsToCarry')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="availability">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Months</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {months.map((month) => (
                          <label key={month} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.availableMonths.includes(month)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    availableMonths: [...prev.availableMonths, month]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    availableMonths: prev.availableMonths.filter(m => m !== month)
                                  }));
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Available Dates</CardTitle>
                      <CardDescription>Add specific dates when this event is available</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.availableDates.map((dateEntry, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Date Entry {index + 1}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  availableDates: prev.availableDates.filter((_, i) => i !== index)
                                }));
                              }}
                              disabled={formData.availableDates.length === 1}
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Month</Label>
                              <Select 
                                value={dateEntry.month} 
                                onValueChange={(value) => {
                                  const newDates = [...formData.availableDates];
                                  newDates[index].month = value;
                                  setFormData(prev => ({ ...prev, availableDates: newDates }));
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Year</Label>
                              <Input
                                type="number"
                                value={dateEntry.year || ''}
                                onChange={(e) => {
                                  const newDates = [...formData.availableDates];
                                  newDates[index].year = parseInt(e.target.value) || new Date().getFullYear();
                                  setFormData(prev => ({ ...prev, availableDates: newDates }));
                                }}
                                placeholder="2024"
                                min={new Date().getFullYear()}
                                max={new Date().getFullYear() + 5}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            availableDates: [...prev.availableDates, {
                              month: '',
                              year: new Date().getFullYear(),
                              dates: [],
                              location: '',
                              totalSeats: 20,
                              availableSeats: 20
                            }]
                          }));
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
                    {formData.itinerary.map((day, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Day {day.day}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItinerary = formData.itinerary.filter((_, i) => i !== index);
                              newItinerary.forEach((item, i) => { item.day = i + 1; });
                              setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={day.title}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[index].title = e.target.value;
                                setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                              }}
                              required
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={day.location || ''}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[index].location = e.target.value;
                                setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={day.description}
                            onChange={(e) => {
                              const newItinerary = [...formData.itinerary];
                              newItinerary[index].description = e.target.value;
                              setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                            }}
                            rows={2}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          itinerary: [...prev.itinerary, {
                            day: prev.itinerary.length + 1,
                            title: '',
                            location: '',
                            description: '',
                            activities: [''],
                            meals: [''],
                            accommodation: '',
                            images: ['']
                          }]
                        }));
                      }}
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
                      {formData.inclusions.map((inclusion, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={inclusion}
                            onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                            placeholder="What's included"
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
                        onClick={() => addArrayItem('inclusions')}
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
                      {formData.exclusions.map((exclusion, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={exclusion}
                            onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                            placeholder="What's not included"
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
                        onClick={() => addArrayItem('exclusions')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Exclusion
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
                      <Label>Physical Requirements</Label>
                      <Textarea
                        value={formData.preparation.physicalRequirements}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preparation: { ...prev.preparation, physicalRequirements: e.target.value }
                        }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Medical Requirements</Label>
                      <Textarea
                        value={formData.preparation.medicalRequirements}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preparation: { ...prev.preparation, medicalRequirements: e.target.value }
                        }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Experience Level</Label>
                      <Textarea
                        value={formData.preparation.experienceLevel}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preparation: { ...prev.preparation, experienceLevel: e.target.value }
                        }))}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Safety Guidelines</Label>
                      <div className="space-y-2">
                        {formData.preparation.safetyGuidelines.map((guideline, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={guideline}
                              onChange={(e) => {
                                const newGuidelines = [...formData.preparation.safetyGuidelines];
                                newGuidelines[index] = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  preparation: { ...prev.preparation, safetyGuidelines: newGuidelines }
                                }));
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newGuidelines = formData.preparation.safetyGuidelines.filter((_, i) => i !== index);
                                setFormData(prev => ({
                                  ...prev,
                                  preparation: { ...prev.preparation, safetyGuidelines: newGuidelines }
                                }));
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
                            const newGuidelines = [...formData.preparation.safetyGuidelines, ''];
                            setFormData(prev => ({
                              ...prev,
                              preparation: { ...prev.preparation, safetyGuidelines: newGuidelines }
                            }));
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Guideline
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={formData.preparation.additionalNotes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preparation: { ...prev.preparation, additionalNotes: e.target.value }
                        }))}
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