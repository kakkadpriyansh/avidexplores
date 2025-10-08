'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  User
} from 'lucide-react';

interface Inquiry {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adventureInterest?: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/inquiries');
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    fetchInquiries();
  }, [session, status, router]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      
      const response = await fetch(`/api/inquiries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries || []);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setInquiries(inquiries.map(inquiry => 
          inquiry._id === inquiryId ? { ...inquiry, status: newStatus as any } : inquiry
        ));
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-foreground mb-2">
                Inquiries Management
              </h1>
              <p className="text-muted-foreground">
                Manage customer inquiries and contact form submissions
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="card-adventure mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search inquiries by name, email, or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="ALL">All Status</option>
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                <Button onClick={fetchInquiries}>
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inquiries List */}
          {inquiries.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No inquiries found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'ALL' 
                    ? 'No inquiries match your current filters.' 
                    : 'No customer inquiries yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry._id} className="card-adventure">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            {inquiry.firstName} {inquiry.lastName}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{inquiry.email}</span>
                            </div>
                            {inquiry.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{inquiry.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(inquiry.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(inquiry.status)}>
                          {inquiry.status.replace('_', ' ')}
                        </Badge>
                        <select
                          value={inquiry.status}
                          onChange={(e) => updateStatus(inquiry._id, e.target.value)}
                          className="px-2 py-1 text-xs border border-border rounded bg-background"
                        >
                          <option value="NEW">New</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inquiry.adventureInterest && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-foreground">Adventure Interest: </span>
                        <span className="text-sm text-muted-foreground">{inquiry.adventureInterest}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-foreground">Message:</span>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {inquiry.message}
                      </p>
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