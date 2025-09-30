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
import { 
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  Upload,
  Star,
  MapPin,
  Tag,
  FileText
} from 'lucide-react';

interface StoryFormData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  images: string[];
  tags: string[];
  category: string;
  readTime: number;
  isFeatured: boolean;
  isPublished: boolean;
}

export default function CreateStoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    images: [],
    tags: [],
    category: '',
    readTime: 5,
    isFeatured: false,
    isPublished: false
  });
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/stories/create');
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  const handleInputChange = (field: keyof StoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 200) {
      newErrors.excerpt = 'Excerpt must be less than 200 characters';
    }

    if (!formData.coverImage.trim()) {
      newErrors.coverImage = 'Cover image is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.readTime || formData.readTime < 1) {
      newErrors.readTime = 'Read time must be at least 1 minute';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm() && !isDraft) return;

    try {
      setLoading(true);
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          isPublished: !isDraft && formData.isPublished
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/admin/stories');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to create story' });
      }
    } catch (error) {
      console.error('Error creating story:', error);
      setErrors({ submit: 'An error occurred while creating the story' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Preview story:', formData);
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
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/stories')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stories
            </Button>
            <div>
              <h1 className="text-3xl font-product-sans font-bold text-foreground">
                Create New Story
              </h1>
              <p className="text-muted-foreground">
                Share a new travel experience
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter story title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of the story (max 200 characters)..."
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={3}
                      maxLength={200}
                      className={errors.excerpt ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.excerpt && (
                        <p className="text-red-500 text-sm">{errors.excerpt}</p>
                      )}
                      <p className="text-muted-foreground text-sm ml-auto">
                        {formData.excerpt.length}/200
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="coverImage">Cover Image URL *</Label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="coverImage"
                        placeholder="Enter cover image URL..."
                        value={formData.coverImage}
                        onChange={(e) => handleInputChange('coverImage', e.target.value)}
                        className={`pl-10 ${errors.coverImage ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.coverImage && (
                      <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a category</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Culture">Culture</option>
                      <option value="Food">Food</option>
                      <option value="Nature">Nature</option>
                      <option value="Photography">Photography</option>
                      <option value="Travel Tips">Travel Tips</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="readTime">Read Time (minutes) *</Label>
                    <Input
                      id="readTime"
                      type="number"
                      min="1"
                      placeholder="5"
                      value={formData.readTime}
                      onChange={(e) => handleInputChange('readTime', parseInt(e.target.value) || 1)}
                      className={errors.readTime ? 'border-red-500' : ''}
                    />
                    {errors.readTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.readTime}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle>Story Content *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write your story content here..."
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={15}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                  )}
                </CardContent>
              </Card>

              {/* Images */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter image URL..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addImage()}
                    />
                    <Button onClick={addImage} type="button">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <img
                              src={image}
                              alt={`Story image ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeImage(image)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="isPublished">Publish immediately</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="isFeatured" className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Featured story
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} type="button">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-primary hover:text-primary/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {errors.tags && (
                    <p className="text-red-500 text-sm">{errors.tags}</p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="card-adventure">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmit(true)}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmit(false)}
                    className="w-full"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : (formData.isPublished ? 'Create & Publish' : 'Create Story')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}