'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DestinationCard {
  _id: string;
  title: string;
  photo: string;
  link: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDestinationCardsPage() {
  const [cards, setCards] = useState<DestinationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/destination-cards?admin=true');
      const data = await response.json();
      if (data.success) {
        setCards(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch destination cards',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch destination cards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination card?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/destination-cards/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setCards(cards.filter(card => card._id !== id));
        toast({
          title: 'Success',
          description: 'Destination card deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete destination card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete destination card',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading destination cards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Destination Cards</h1>
          <p className="text-muted-foreground mt-2">Manage destination cards displayed on the homepage</p>
        </div>
        <Link href="/admin/destination-cards/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Card
          </Button>
        </Link>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-muted-foreground text-center">
              <h3 className="text-lg font-semibold mb-2">No destination cards found</h3>
              <p className="mb-4">Create your first destination card to get started.</p>
              <Link href="/admin/destination-cards/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Card
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card._id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={card.photo}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={card.isActive ? 'default' : 'secondary'}>
                    {card.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Order: {card.order}</span>
                  <span>•</span>
                  <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Link
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Link
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`/admin/destination-cards/${card._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(card._id)}
                      disabled={deleting === card._id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}