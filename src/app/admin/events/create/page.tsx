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
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  discountedPrice?: number;
  location: string;
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
  };

  const removeItineraryDay = (index: number) => {
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    // Renumber days
    newItinerary.forEach((item, i) => {
      item.day = i + 1;
    });
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

  if (!session || session.user.role !== 'ADMIN') {
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
                <h1 className="text-3xl font-montserrat font-bold text-foreground">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
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
                      value={formData.discountedPrice || ''}
                      onChange={(e) => handleInputChange('discountedPrice', parseFloat(e.target.value) || undefined)}
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

            {/* Available Months */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Available Months</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
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

            {/* Available Dates */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Available Dates</CardTitle>
                <p className="text-sm text-gray-600">Add specific dates when this event is available</p>
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
                        <Label htmlFor={`month-${index}`}>Month</Label>
                        <select
                          id={`month-${index}`}
                          value={dateEntry.month}
                          onChange={(e) => {
                            const newDates = [...formData.availableDates];
                            newDates[index].month = e.target.value;
                            setFormData(prev => ({ ...prev, availableDates: newDates }));
                          }}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Month</option>
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                            <option key={month} value={month}>{month}</option>
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
                    
                    <div>
                      <Label htmlFor={`location-${index}`}>Location (Optional)</Label>
                      <Input
                        id={`location-${index}`}
                        value={dateEntry.location || ''}
                        onChange={(e) => {
                          const newDates = [...formData.availableDates];
                          newDates[index].location = e.target.value;
                          setFormData(prev => ({ ...prev, availableDates: newDates }));
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
                            const newDates = [...formData.availableDates];
                            const totalSeats = parseInt(e.target.value) || 0;
                            newDates[index].totalSeats = totalSeats;
                            // Auto-set available seats to total seats if not set
                            if (!newDates[index].availableSeats) {
                              newDates[index].availableSeats = totalSeats;
                            }
                            setFormData(prev => ({ ...prev, availableDates: newDates }));
                          }}
                          placeholder="Total seats available"
                          min="1"
                          max="100"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`availableSeats-${index}`}>Available Seats</Label>
                        <Input
                          id={`availableSeats-${index}`}
                          type="number"
                          value={dateEntry.availableSeats || ''}
                          onChange={(e) => {
                            const newDates = [...formData.availableDates];
                            newDates[index].availableSeats = parseInt(e.target.value) || 0;
                            setFormData(prev => ({ ...prev, availableDates: newDates }));
                          }}
                          placeholder="Currently available seats"
                          min="0"
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
                                  const newDates = [...formData.availableDates];
                                  newDates[index].dates = newDates[index].dates.filter((_, i) => i !== dateIndex);
                                  setFormData(prev => ({ ...prev, availableDates: newDates }));
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
                                  const newDates = [...formData.availableDates];
                                  newDates[index].dates = [...newDates[index].dates, date].sort((a, b) => a - b);
                                  setFormData(prev => ({ ...prev, availableDates: newDates }));
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
                                const newDates = [...formData.availableDates];
                                newDates[index].dates = [...newDates[index].dates, date].sort((a, b) => a - b);
                                setFormData(prev => ({ ...prev, availableDates: newDates }));
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
                      <h4 className="font-semibold">Day {dayIndex + 1}</h4>
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
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItineraryDay}
                  className="w-full"
                >
                  Add New Day
                </Button>
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