'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  Calendar, 
  BookOpen, 
  MapPin,
  Clock,
  MessageSquare,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeBookings: 0,
    storiesShared: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    // Fetch real user bookings and stats
    const fetchDashboardData = async () => {
      try {
        // Fetch user bookings
        const bookingsResponse = await fetch('/api/user/bookings');
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          const bookings = bookingsData.data || [];
          
          // Calculate stats from real data
          const activeBookings = bookings.filter((b: any) => 
            b.status === 'CONFIRMED' || b.status === 'PENDING'
          ).length;
          
          setStats({
            activeBookings,
            storiesShared: 0 // This would need a separate API endpoint
          });
          
          // Set recent bookings (last 3)
          setRecentBookings(bookings.slice(0, 3).map((booking: any) => ({
            id: booking._id,
            eventTitle: booking.eventId?.title || 'Unknown Event',
            date: new Date(booking.date).toLocaleDateString(),
            status: booking.status.toLowerCase(),
            amount: booking.finalAmount || 0
          })));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to empty state
        setStats({
          activeBookings: 0,
          storiesShared: 0
        });
        setRecentBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, status, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout 
      title={`Welcome back, ${session.user?.name}!`}
      description="Manage your adventures and explore new destinations"
    >

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card 
          className="card-adventure cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/dashboard/bookings')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-adventure">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stories Shared</p>
                <p className="text-2xl font-bold text-foreground">{stats.storiesShared}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="card-adventure cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/events')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Explore Events</p>
                <p className="text-2xl font-bold text-foreground">New</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card className="card-adventure">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/bookings')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No bookings yet</p>
                  <Button onClick={() => router.push('/events')}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Explore Events
                  </Button>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/booking/${booking.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{booking.eventTitle}</h4>
                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(booking.status)
                      }`}>
                        {booking.status}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">₹{booking.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-adventure">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/events')}
              >
                <Calendar className="h-6 w-6" />
                <span>Book Adventure</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/events')}
              >
                <MapPin className="h-6 w-6" />
                <span>Explore Events</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/contact')}
              >
                <MessageSquare className="h-6 w-6" />
                <span>Contact Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}