'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin');
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchAnalytics(period);
  }, [session, status, router, period]);

  const fetchAnalytics = async (p: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/analytics/dashboard?period=${p}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch analytics');
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  const overview = analytics?.overview || { totalUsers: 0, totalEvents: 0, totalBookings: 0, totalRevenue: 0 };

  const dashboardStats = [
    {
      title: 'Total Users',
      value: overview.totalUsers.toString(),
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600'
    },
    {
      title: 'Total Events',
      value: overview.totalEvents.toString(),
      icon: Calendar,
      description: 'Events in catalog',
      color: 'text-green-600'
    },
    {
      title: 'Total Bookings',
      value: overview.totalBookings.toString(),
      icon: BookOpen,
      description: 'All time bookings',
      color: 'text-purple-600'
    },
    {
      title: 'Revenue',
      value: `₹${(overview.totalRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      description: 'Total revenue',
      color: 'text-orange-600'
    }
  ];

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = (analytics?.charts?.monthlyRevenue || []).map((m: any) => ({
    name: `${monthNames[(m._id?.month || 1) - 1]} ${m._id?.year}`,
    revenue: m.revenue || 0,
    bookings: m.bookings || 0,
  }));

  const bookingStatusData = (analytics?.charts?.bookingStatusStats || []).map((s: any) => ({
    name: s._id,
    value: s.count,
  }));

  const pieColors = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#14b8a6'];

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Add a new adventure',
      icon: Plus,
      color: 'bg-primary',
      action: () => router.push('/admin/events/create'),
    },
    {
      title: 'View Events',
      description: 'Manage all events',
      icon: Eye,
      color: 'bg-blue-600',
      action: () => router.push('/admin/events'),
    },
    {
      title: 'Create Story',
      description: 'Share new story',
      icon: Plus,
      color: 'bg-emerald-600',
      action: () => router.push('/admin/stories/create'),
    },
    {
      title: 'View Bookings',
      description: 'See latest bookings',
      icon: BookOpen,
      color: 'bg-purple-600',
      action: () => router.push('/admin/bookings'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-2 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your adventure platform and monitor business metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="border border-border/50 rounded-md bg-background px-2 py-1 text-sm"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          {error ? (
            <Card className="card-adventure mb-8">
              <CardContent className="p-6 text-red-600 text-sm">{error}</CardContent>
            </Card>
          ) : null}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="card-adventure">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.description}
                        </p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
                  }}
                  className="w-full"
                >
                  <AreaChart data={monthlyData} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.15} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="card-adventure">
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="w-full">
                  <PieChart>
                    <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {bookingStatusData.map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        onClick={action.action}
                        className={`${action.color} text-white p-6 h-auto flex-col items-start space-y-2`}
                      >
                        <Icon className="h-6 w-6" />
                        <div className="text-left">
                          <div className="font-semibold">{action.title}</div>
                          <div className="text-xs opacity-90">{action.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-adventure">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Recent Bookings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.recentBookings || []).map((b: any) => (
                    <div key={b._id || b.bookingId} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">{b.eventId?.title || 'Event'}</p>
                          <p className="text-xs text-muted-foreground">{b.userId?.name || b.userId?.email || 'Guest'} • ₹{(b.finalAmount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge className="bg-muted text-foreground">{b.status}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => router.push('/admin/bookings')}>
                    View all bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}