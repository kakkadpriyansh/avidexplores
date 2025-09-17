'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout, DashboardSearch } from '@/components/dashboard/DashboardLayout';
import { 
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Filter,
  ThumbsUp,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

interface UserReview {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    location: string;
    images: string[];
  };
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export default function ReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    comment: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/dashboard/reviews');
      return;
    }
    
    fetchUserReviews();
  }, [session, status, router]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review: UserReview) => {
    setEditingReview(review._id);
    setEditForm({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
  };

  const handleSaveReview = async (reviewId: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        const updatedReview = await response.json();
        setReviews(reviews.map(review => 
          review._id === reviewId ? { ...review, ...editForm, updatedAt: new Date().toISOString() } : review
        ));
        setEditingReview(null);
      } else {
        alert('Failed to update review. Please try again.');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('An error occurred while updating your review.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setReviews(reviews.filter(review => review._id !== reviewId));
      } else {
        alert('Failed to delete review. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('An error occurred while deleting your review.');
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, title: '', comment: '' });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.eventId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === null || review.rating === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout 
        title="My Reviews"
        description="Manage your event reviews and feedback"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout 
      title="My Reviews"
      description="Manage your event reviews and feedback"
    >
      {/* Header Actions */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => router.push('/dashboard/bookings')}>
          <Plus className="h-4 w-4 mr-2" />
          Write New Review
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-adventure mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <DashboardSearch 
                placeholder="Search reviews by event name, title, or content..."
                onSearch={setSearchTerm}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={ratingFilter || ''}
                onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {reviews.length === 0
                    ? "Complete your adventures and share your experiences!"
                    : "Try adjusting your search or filter criteria."}
                </p>
                <Button onClick={() => router.push('/dashboard/bookings')}>
                  View Your Bookings
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card key={review._id} className="card-adventure">
                  <CardContent className="p-6">
                    {editingReview === review._id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">
                            Editing Review for {review.eventId.title}
                          </h3>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveReview(review._id)}
                              disabled={saving}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Rating
                          </label>
                          {renderStars(editForm.rating, true, (rating) => 
                            setEditForm({ ...editForm, rating })
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Review Title
                          </label>
                          <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            placeholder="Enter a title for your review"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Your Review
                          </label>
                          <Textarea
                            value={editForm.comment}
                            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                            placeholder="Share your experience..."
                            rows={4}
                          />
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Event Image */}
                          <div className="lg:w-32 flex-shrink-0">
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                              {review.eventId.images.length > 0 ? (
                                <img
                                  src={review.eventId.images[0]}
                                  alt={review.eventId.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <MapPin className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Review Content */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  {review.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Review for: {review.eventId.title}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {review.eventId.location}
                                </div>
                              </div>
                              <div className="flex flex-col sm:items-end space-y-2 mt-2 sm:mt-0">
                                {renderStars(review.rating)}
                                <div className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                  {review.updatedAt !== review.createdAt && ' (edited)'}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-foreground">
                              {review.comment}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  <span>{review.helpful} helpful</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>Reviewed on {new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/events/${review.eventId._id}`)}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Event
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditReview(review)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteReview(review._id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {reviews.length > 0 && (
            <Card className="card-adventure mt-8">
              <CardHeader>
                <CardTitle>Review Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {reviews.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {reviews.reduce((sum, review) => sum + review.helpful, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Helpful Votes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {reviews.filter(review => review.rating >= 4).length}
                    </div>
                    <div className="text-sm text-muted-foreground">4+ Star Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
    </DashboardLayout>
  );
}