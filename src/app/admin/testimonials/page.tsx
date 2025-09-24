'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Star, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Award,
  MessageSquare,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface Testimonial {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
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
  createdAt: string;
  updatedAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchTestimonials = async (status?: string, page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (status && status !== 'all') {
        params.append('status', status);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/testimonials?${params}`);
      const data = await response.json();

      if (data.success) {
        setTestimonials(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(activeTab);
  }, [activeTab, searchTerm]);

  const handleStatusChange = async (id: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        fetchTestimonials(activeTab);
      }
    } catch (error) {
      console.error('Error updating testimonial status:', error);
    }
  };

  const handleFeatureToggle = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured })
      });

      if (response.ok) {
        fetchTestimonials(activeTab);
      }
    } catch (error) {
      console.error('Error updating testimonial feature status:', error);
    }
  };

  const handleDelete = async () => {
    if (!testimonialToDelete) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTestimonials(activeTab);
        setDeleteDialogOpen(false);
        setTestimonialToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-montserrat font-bold text-foreground">
            Testimonials Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage customer testimonials and reviews
          </p>
        </div>
        <Link href="/admin/testimonials/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No testimonials found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <Card key={testimonial._id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={testimonial.customerPhoto || testimonial.userId?.avatar || '/placeholder.svg'}
                              alt={testimonial.userId?.name || testimonial.customerName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">
                                {testimonial.userId?.name || testimonial.customerName || 'Anonymous'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {testimonial.userId?.email || testimonial.customerEmail || 'No email'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(testimonial.rating)}
                          </div>
                          {getStatusBadge(testimonial)}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">
                            Event: {testimonial.eventId?.title || testimonial.eventName || 'No event specified'}
                          </p>
                          {testimonial.title && (
                            <h3 className="font-medium mb-2">{testimonial.title}</h3>
                          )}
                          <p className="text-foreground">{testimonial.review}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                          </span>
                          {testimonial.images && testimonial.images.length > 0 && (
                            <span>{testimonial.images.length} image(s)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!testimonial.approved && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(testimonial._id, true)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(testimonial._id, false)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/testimonials/${testimonial._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/testimonials/${testimonial._id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleFeatureToggle(testimonial._id, !testimonial.isFeatured)}
                            >
                              <Award className="h-4 w-4 mr-2" />
                              {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setTestimonialToDelete(testimonial._id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchTestimonials(activeTab, pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchTestimonials(activeTab, pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

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