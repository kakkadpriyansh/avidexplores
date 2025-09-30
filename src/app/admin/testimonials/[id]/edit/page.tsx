'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { Star, ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Event {
  _id: string;
  title: string;
  slug: string;
  location?: string;
}

interface Testimonial {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  eventId?: {
    _id: string;
    title: string;
    slug: string;
    location?: string;
  };
  customerName?: string;
  customerEmail?: string;
  eventName?: string;
  rating: number;
  review: string;
  title?: string;
  customerPhoto?: string;
  images?: string[];
  approved: boolean;
  isPublic: boolean;
  isFeatured: boolean;
}

export default function EditTestimonialPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    eventName: '',
    rating: 5,
    title: '',
    review: '',
    approved: true,
    isPublic: true,
    isFeatured: false,
    customerPhoto: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (params.id) {
      fetchTestimonial();
    }
  }, [params.id]);

  const fetchTestimonial = async () => {
    try {
      const response = await fetch(`/api/admin/testimonials/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const testimonial = data.data;
        setFormData({
          customerName: testimonial.customerName || (testimonial.userId?.name || ''),
          customerEmail: testimonial.customerEmail || (testimonial.userId?.email || ''),
          eventName: testimonial.eventName || (testimonial.eventId?.title || ''),
          rating: testimonial.rating,
          title: testimonial.title || '',
          review: testimonial.review,
          approved: testimonial.approved,
          isPublic: testimonial.isPublic,
          isFeatured: testimonial.isFeatured,
          customerPhoto: testimonial.customerPhoto || '',
          images: testimonial.images || []
        });
      } else {
        router.push('/admin/testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      router.push('/admin/testimonials');
    } finally {
      setInitialLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a copy of the form data to modify
      const submissionData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        eventName: formData.eventName,
        rating: formData.rating,
        title: formData.title,
        review: formData.review,
        approved: formData.approved,
        isPublic: formData.isPublic,
        isFeatured: formData.isFeatured,
        customerPhoto: formData.images && formData.images.length > 0 ? formData.images[0] : '',
        images: formData.images || [],
      };
      
      const response = await fetch(`/api/admin/testimonials/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        // Redirect to testimonials list after successful update
        router.push('/admin/testimonials');
      } else {
        // Try to extract a meaningful error message from the response
        let errorMsg = 'Error updating testimonial';
        try {
          const data = await response.json();
          errorMsg = (data && (data.error || data.message)) || errorMsg;
        } catch (_) {
          // ignore JSON parse errors
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      alert('Error updating testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading testimonial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/testimonials/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-product-sans font-bold text-foreground">
            Edit Testimonial
          </h1>
          <p className="text-muted-foreground mt-2">
            Update testimonial information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="Enter customer email"
                required
              />
            </div>

            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                value={formData.eventName}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex items-center gap-4">
                {renderStars(formData.rating, (rating) => handleInputChange('rating', rating))}
                <span className="text-sm text-muted-foreground">
                  {formData.rating} out of 5 stars
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter testimonial title"
              />
            </div>

            {/* Review */}
            <div className="space-y-2">
              <Label htmlFor="review">Review *</Label>
              <Textarea
                id="review"
                value={formData.review}
                onChange={(e) => handleInputChange('review', e.target.value)}
                placeholder="Enter the customer's review"
                rows={4}
                required
              />
            </div>

            {/* Customer Photo */}
            <div className="space-y-2">
              <Label>Customer Photo (Optional)</Label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ImageUpload
                      value={image}
                      onChange={(url) => {
                        const newImages = [...formData.images];
                        newImages[index] = url;
                        handleInputChange('images', newImages);
                      }}
                      onRemove={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        handleInputChange('images', newImages);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        handleInputChange('images', newImages);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange('images', [...formData.images, ''])}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
            </div>

            {/* Status Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Approved</Label>
                  <p className="text-sm text-muted-foreground">
                    Whether this testimonial is approved for display
                  </p>
                </div>
                <Switch
                  checked={formData.approved}
                  onCheckedChange={(checked) => handleInputChange('approved', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public</Label>
                  <p className="text-sm text-muted-foreground">
                    Whether this testimonial is visible to the public
                  </p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">
                    Whether this testimonial should be featured prominently
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Testimonial'}
              </Button>
              <Link href={`/admin/testimonials/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}