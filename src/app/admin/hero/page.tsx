'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Save, Eye, Image as ImageIcon } from 'lucide-react';

interface HeroSettings {
  backgroundImage: string;
  backgroundImages: string[];
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export default function HeroManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    backgroundImage: '',
    backgroundImages: [],
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }
  }, [session, status, router]);

  // Fetch current hero settings
  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const response = await fetch('/api/settings/hero');
        if (response.ok) {
          const data = await response.json();
          setHeroSettings({
            backgroundImage: data.data?.backgroundImage || '',
            backgroundImages: data.data?.backgroundImages || [],
            title: data.data?.title || '',
            subtitle: data.data?.subtitle || '',
            ctaText: data.data?.ctaText || '',
            ctaLink: data.data?.ctaLink || ''
          });
        } else {
          toast.error('Failed to load hero settings');
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
        toast.error('Failed to load hero settings');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchHeroSettings();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleInputChange = (field: keyof HeroSettings, value: string) => {
    setHeroSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setHeroSettings(prev => ({
          ...prev,
          backgroundImages: [...prev.backgroundImages, data.url]
        }));
        toast.success('Image uploaded successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(heroSettings),
      });

      if (response.ok) {
        toast.success('Hero settings updated successfully');
      } else {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        toast.error(errorData.error || 'Failed to update hero settings');
      }
    } catch (error) {
      console.error('Error updating hero settings:', error);
      toast.error('Failed to update hero settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hero Section Management</h1>
            <p className="text-gray-600 mt-2">Manage the hero section content and background image</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Background Image
              </CardTitle>
              <CardDescription>
                Upload a high-quality background image for the hero section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Background Images (Carousel)</Label>
                {heroSettings.backgroundImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative w-24 h-16 rounded overflow-hidden border">
                      <img src={img || '/placeholder.jpg'} alt={`Background ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <Input
                      value={img}
                      onChange={(e) => {
                        const newImages = [...heroSettings.backgroundImages];
                        newImages[idx] = e.target.value;
                        setHeroSettings(prev => ({ ...prev, backgroundImages: newImages }));
                      }}
                      placeholder="Image URL"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newImages = heroSettings.backgroundImages.filter((_, i) => i !== idx);
                        setHeroSettings(prev => ({ ...prev, backgroundImages: newImages }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <Label htmlFor="hero-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </div>
                  <input
                    id="hero-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </Label>
                
                <div className="text-sm text-gray-500">
                  Recommended: 1920x1080px, max 10MB
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setHeroSettings(prev => ({ ...prev, backgroundImages: [...prev.backgroundImages, ''] }));
                }}
                className="w-full"
              >
                Add Image URL
              </Button>
            </CardContent>
          </Card>

          {/* Hero Content */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Content</CardTitle>
              <CardDescription>
                Configure the text content and call-to-action for the hero section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Main Title</Label>
                <Input
                  id="title"
                  value={heroSettings.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Discover Your Next Adventure"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={heroSettings.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="From challenging mountain treks to peaceful camping escapes..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cta-text">Call-to-Action Button Text</Label>
                <Input
                  id="cta-text"
                  value={heroSettings.ctaText}
                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                  placeholder="Explore Adventures"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cta-link">Call-to-Action Button Link</Label>
                <Input
                  id="cta-link"
                  value={heroSettings.ctaLink}
                  onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                  placeholder="/events"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Preview how your hero section will look (actual styling may vary)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="relative h-48 rounded-lg overflow-hidden flex items-center justify-center text-white"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroSettings.backgroundImages[0] || heroSettings.backgroundImage || '/placeholder.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="text-center max-w-4xl px-6">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  {heroSettings.title || 'Hero Title'}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200">
                  {heroSettings.subtitle || 'Hero subtitle will appear here'}
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                  {heroSettings.ctaText || 'CTA Button'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}