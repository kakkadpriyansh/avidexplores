'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ImageUpload } from '@/components/ui/image-upload';

interface DestinationCard {
  _id: string;
  title: string;
  photo: string;
  link: string;
  isActive: boolean;
  order: number;
}

export default function EditDestinationCardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    photo: '',
    link: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/destination-cards/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        const card = data.data;
        setFormData({
          title: card.title || '',
          photo: card.photo || '',
          link: card.link || '',
          isActive: card.isActive ?? true,
          order: card.order || 0
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch destination card',
          variant: 'destructive',
        });
        router.push('/admin/destination-cards');
      }
    } catch (error) {
      console.error('Error fetching card:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch destination card',
        variant: 'destructive',
      });
      router.push('/admin/destination-cards');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.photo || !formData.link) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/destination-cards/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Destination card updated successfully',
        });
        router.push('/admin/destination-cards');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update destination card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: 'Error',
        description: 'Failed to update destination card',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading destination card...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/destination-cards">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Destination Card</h1>
            <p className="text-muted-foreground mt-2">Update destination card details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Destination Card Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter destination title (e.g., Ladakh, Kerala) (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo *</Label>
                <ImageUpload
                  value={formData.photo}
                  onChange={(url) => handleInputChange('photo', url)}
                  placeholder="Upload destination photo or enter URL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link *</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  placeholder="Enter destination link (e.g., /events?destination=ladakh)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                  placeholder="Enter display order (0 = first)"
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active (visible on homepage)</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Card'}
                </Button>
                <Link href="/admin/destination-cards">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}