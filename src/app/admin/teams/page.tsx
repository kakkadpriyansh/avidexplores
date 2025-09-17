'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Filter, Users as UsersIcon, Star } from 'lucide-react';

interface TeamItem {
  _id: string;
  name: string;
  role: string;
  experience: string;
  image: string;
  specialties: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function AdminTeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?callbackUrl=/admin/teams');
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchMembers();
  }, [session, status, router]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams?admin=true');
      if (response.ok) {
        const data = await response.json();
        const items: TeamItem[] = (data.data || []).map((m: any) => ({
          _id: m._id,
          name: m.name,
          role: m.role,
          experience: m.experience,
          image: m.image,
          specialties: m.specialties || [],
          isActive: m.isActive,
          order: m.order || 0,
          createdAt: m.createdAt
        }));
        setMembers(items);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      const response = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMembers(members.filter(m => m._id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Error deleting member');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !active })
      });
      if (response.ok) {
        setMembers(members.map(m => m._id === id ? { ...m, isActive: !active } : m));
      }
    } catch (error) {
      console.error('Toggle active failed:', error);
    }
  };

  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && m.isActive) || (statusFilter === 'INACTIVE' && !m.isActive);
    return matchesSearch && matchesStatus;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-foreground mb-2">
                Team Management
              </h1>
              <p className="text-muted-foreground">Create, edit, and manage team members</p>
            </div>
            <Button onClick={() => router.push('/admin/teams/create')} className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          {/* Filters */}
          <Card className="card-adventure mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="Search by name or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-border rounded-md bg-background text-foreground">
                    <option value="ALL">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Grid */}
          {filtered.length === 0 ? (
            <Card className="card-adventure">
              <CardContent className="p-12 text-center">
                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first team member.</p>
                <Button onClick={() => router.push('/admin/teams/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((m) => (
                <Card key={m._id} className="card-adventure">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold line-clamp-2">{m.name}</CardTitle>
                      <Badge className={m.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {m.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">{m.role} • {m.experience}</div>
                      <div className="flex flex-wrap gap-2">
                        {(m.specialties || []).slice(0,4).map((s, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{s}</span>
                        ))}
                        {m.specialties.length > 4 && <span className="text-xs text-muted-foreground">+{m.specialties.length - 4} more</span>}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/teams/${m._id}/edit`)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggleActive(m._id, m.isActive)}>
                          <Star className="h-4 w-4 mr-1" /> {m.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(m._id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
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