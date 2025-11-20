'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Calendar,
  User,
  MapPin,
  Star,
  Image as ImageIcon,
  Tag
} from 'lucide-react';

interface Story {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  readTime: number;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  eventId?: {
    _id: string;
    title: string;
    slug: string;
  };
  images: string[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  likes: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminStoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<string>('ALL');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/stories');
      return;
    }
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUB_ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    fetchStories();
  }, [session, status, router]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (storyId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished: !isPublished })
      });
      
      if (response.ok) {
        setStories(stories.map(story => 
          story._id === storyId ? { ...story, isPublished: !isPublished } : story
        ));
      }
    } catch (error) {
      console.error('Error updating story published status:', error);
    }
  };

  const handleToggleFeatured = async (storyId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFeatured: !isFeatured })
      });
      
      if (response.ok) {
        setStories(stories.map(story => 
          story._id === storyId ? { ...story, isFeatured: !isFeatured } : story
        ));
      }
    } catch (error) {
      console.error('Error updating story featured status:', error);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(storyId);
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setStories(stories.filter(story => story._id !== storyId));
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'PUBLISHED' && story.isPublished) ||
      (statusFilter === 'DRAFT' && !story.isPublished);
    
    const matchesFeatured = featuredFilter === 'ALL' || 
      (featuredFilter === 'FEATURED' && story.isFeatured) ||
      (featuredFilter === 'REGULAR' && !story.isFeatured);
    
    return matchesSearch && matchesStatus && matchesFeatured;
  });

  if (status === 'loading' || loading) {
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
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">
                Story Management
              </h1>
              <p className="text-muted-foreground">
                Manage travel stories and experiences
              </p>
            </div>
            <Button 
              onClick={() => router.push('/admin/stories/create')}
              className="mt-4 sm:mt-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Story
            </Button>
          </div>

          {/* Filters */}
          <Card className="card-adventure mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by title, author, location, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={featuredFilter}
                      onChange={(e) => setFeaturedFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="ALL">All Stories</option>
                      <option value="FEATURED">Featured</option>
                      <option value="REGULAR">Regular</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stories List */}
          {filteredStories.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No stories found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'ALL' || featuredFilter !== 'ALL'
                    ? 'No stories match your current filters.'
                    : 'No stories have been created yet.'}
                </p>
                <Button onClick={() => router.push('/admin/stories/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Story
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <Card key={story._id} className="card-adventure">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Story Image */}
                      {story.images.length > 0 ? (
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={story.images[0]}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Story Info */}
                      <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                              {story.title}
                            </h3>
                            <div className="flex space-x-1 ml-2">
                              {story.isFeatured && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              <Badge className={story.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {story.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {story.excerpt}
                        </p>
                        
                        <div className="flex items-center text-xs text-muted-foreground space-x-4">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {story.userId.name}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {story.category}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(story.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex space-x-3">
                            <span>{story.views} views</span>
                            <span>{story.likes.length} likes</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {story.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {story.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{story.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/stories/${story.slug}`)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/stories/${story._id}/edit`)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={story.isPublished ? 'outline' : 'default'}
                            onClick={() => handleTogglePublished(story._id, story.isPublished)}
                            className="flex-1"
                          >
                            {story.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            variant={story.isFeatured ? 'outline' : 'secondary'}
                            onClick={() => handleToggleFeatured(story._id, story.isFeatured)}
                            className="flex-1"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {story.isFeatured ? 'Unfeature' : 'Feature'}
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteStory(story._id)}
                          disabled={deleting === story._id}
                          className="w-full"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {deleting === story._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}