'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Plus, X, Eye, Save, Upload, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface StoryFormData {
  title: string
  content: string
  excerpt: string
  coverImage: string
  category: string
  readTime: number
  images: string[]
  tags: string[]
  isFeatured: boolean
  isPublished: boolean
}

interface FormErrors {
  title?: string
  content?: string
  excerpt?: string
  coverImage?: string
  category?: string
  readTime?: string
  tags?: string
}

export default function EditStoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingStory, setFetchingStory] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [newTag, setNewTag] = useState('')
  const [newImage, setNewImage] = useState('')
  
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: '',
    readTime: 5,
    images: [],
    tags: [],
    isFeatured: false,
    isPublished: false
  })

  // Fetch existing story data
  useEffect(() => {
    const fetchStory = async () => {
      if (!params.id) return
      
      try {
        const response = await fetch(`/api/stories/${params.id}`)
        if (response.ok) {
          const result = await response.json()
          const story = result.data
          
          setFormData({
            title: story.title || '',
            content: story.content || '',
            excerpt: story.excerpt || '',
            coverImage: story.coverImage || '',
            category: story.category || '',
            readTime: story.readTime || 5,
            images: story.images || [],
            tags: story.tags || [],
            isFeatured: story.isFeatured || false,
            isPublished: story.isPublished || false
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch story data",
            variant: "destructive"
          })
          router.push('/admin/stories')
        }
      } catch (error) {
        console.error('Error fetching story:', error)
        toast({
          title: "Error",
          description: "Failed to fetch story data",
          variant: "destructive"
        })
        router.push('/admin/stories')
      } finally {
        setFetchingStory(false)
      }
    }

    if (status === 'authenticated') {
      fetchStory()
    }
  }, [params.id, status, router, toast])

  const handleInputChange = (field: keyof StoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }))
      setNewImage('')
    }
  }

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.trim().length < 100) {
      newErrors.content = 'Content must be at least 100 characters'
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required'
    } else if (formData.excerpt.trim().length > 300) {
      newErrors.excerpt = 'Excerpt cannot exceed 300 characters'
    }

    if (!formData.coverImage.trim()) {
      newErrors.coverImage = 'Cover image is required'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (!formData.readTime || formData.readTime < 1) {
      newErrors.readTime = 'Read time must be at least 1 minute'
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (publish: boolean = false) => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/stories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          isPublished: publish || formData.isPublished
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "Story updated successfully"
        })
        router.push('/admin/stories')
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update story",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating story:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    // Store form data in sessionStorage for preview
    sessionStorage.setItem('storyPreview', JSON.stringify(formData))
    window.open('/admin/stories/preview', '_blank')
  }

  if (status === 'loading' || fetchingStory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading story...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Button onClick={() => router.push('/admin')} variant="outline">
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin/stories')}
              className="mb-4"
            >
              ← Back to Stories
            </Button>
            <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">
              Edit Story
            </h1>
            <p className="text-muted-foreground">
              Update your travel story and share your experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
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
                      placeholder="Brief description of your story (max 300 characters)..."
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      className={`min-h-[100px] ${errors.excerpt ? 'border-red-500' : ''}`}
                      maxLength={300}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.excerpt && (
                        <p className="text-red-500 text-sm">{errors.excerpt}</p>
                      )}
                      <p className="text-sm text-muted-foreground ml-auto">
                        {formData.excerpt.length}/300
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
                      <option value="TRAVEL">Travel</option>
                      <option value="ADVENTURE">Adventure</option>
                      <option value="CULTURE">Culture</option>
                      <option value="FOOD">Food</option>
                      <option value="TIPS">Tips</option>
                      <option value="GUIDE">Guide</option>
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
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="content">Story Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your story here... (minimum 100 characters)"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      className={`min-h-[400px] ${errors.content ? 'border-red-500' : ''}`}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.content.length} characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {errors.tags && (
                    <p className="text-red-500 text-sm">{errors.tags}</p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Image URL..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    />
                    <Button type="button" onClick={addImage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <img src={image} alt={`Additional ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                        <span className="flex-1 text-sm truncate">{image}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Publishing Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Publishing Options</CardTitle>
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

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
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
                      onClick={() => handleSubmit(false)}
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Draft'}
                    </Button>
                    
                    <Button
                      onClick={() => handleSubmit(true)}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Publishing...' : 'Update & Publish'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}