'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Star, 
  Check, 
  X, 
  Award,
  Calendar,
  User,
  MapPin,
  MessageSquare
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  eventId: {
    _id: string;
    title: string;
    slug: string;
    location?: string;
  };
  rating: number;
  review: string;
  title?: string;
  images?: string[];
  approved: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TestimonialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTestimonial();
    }
  }, [params.id]);

  const fetchTestimonial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/testimonials/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setTestimonial(data.data);
      } else {
        router.push('/admin/testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      router.push('/admin/testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (approved: boolean) => {
    if (!testimonial) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        fetchTestimonial();
        toast({ title: 'Update done' });
      }
    } catch (error) {
      console.error('Error updating testimonial status:', error);
    }
  };

  const handleFeatureToggle = async () => {
    if (!testimonial) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !testimonial.isFeatured })
      });

      if (response.ok) {
        fetchTestimonial();
        toast({ title: 'Update done' });
      }
    } catch (error) {
      console.error('Error updating testimonial feature status:', error);
    }
  };

  const handleDelete = async () => {
    if (!testimonial) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/admin/testimonials');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (testimonial: Testimonial) => {
    if (!testimonial.approved) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (testimonial.isFeatured) {
      return <Badge variant="default">Featured</Badge>;
    }
    return <Badge variant="outline">Approved</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading testimonial...</p>
        </div>
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Testimonial not found</p>
          <Link href="/admin/testimonials">
            <Button className="mt-4">Back to Testimonials</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/testimonials">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-montserrat font-bold text-foreground">
            Testimonial Details
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage testimonial information
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/testimonials/${testimonial._id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Testimonial Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Testimonial Content
                </CardTitle>
                {getStatusBadge(testimonial)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                  <span className="text-sm text-muted-foreground">
                    {testimonial.rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Title */}
              {testimonial.title && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                  <p className="mt-1 font-medium">{testimonial.title}</p>
                </div>
              )}

              {/* Review */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Review</Label>
                <p className="mt-1 text-foreground leading-relaxed">{testimonial.review}</p>
              </div>

              {/* Images */}
              {testimonial.images && testimonial.images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {testimonial.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Testimonial image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.userId?.avatar || '/placeholder.svg'}
                  alt={testimonial.userId?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{testimonial.userId?.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.userId?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{testimonial.eventId?.title}</p>
              {testimonial.eventId?.location && (
                <p className="text-sm text-muted-foreground">{testimonial.eventId.location}</p>
              )}
              <Link 
                href={`/admin/events/${testimonial.eventId?._id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Event Details
              </Link>
            </CardContent>
          </Card>

          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Approved</span>
                  <Badge variant={testimonial.approved ? "default" : "secondary"}>
                    {testimonial.approved ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Public</span>
                  <Badge variant={testimonial.isPublic ? "default" : "secondary"}>
                    {testimonial.isPublic ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Featured</span>
                  <Badge variant={testimonial.isFeatured ? "default" : "secondary"}>
                    {testimonial.isFeatured ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                {!testimonial.approved ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(true)}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(false)}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(false)}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Unapprove
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFeatureToggle}
                  className="w-full"
                >
                  <Award className="h-4 w-4 mr-1" />
                  {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(testimonial.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{new Date(testimonial.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{children}</label>;
}