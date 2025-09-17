'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EditTeamMemberPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    role: '',
    teamType: 'Core Team' as 'Founders' | 'Core Team',
    experience: '',
    image: '',
    specialties: '',
    bio: '',
    email: '',
    phone: '',
    isActive: true,
    order: 0,
    socialMedia: {
      linkedin: '',
      instagram: '',
      twitter: '',
      facebook: '',
    },
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(`/login?callbackUrl=/admin/teams/${id}/edit`);
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchMember();
  }, [session, status, router, id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teams/${id}`);
      if (res.ok) {
        const data = await res.json();
        const m = data.data;
        setForm({
          name: m.name || '',
          role: m.role || '',
          teamType: m.teamType || 'Core Team',
          experience: m.experience || '',
          image: m.image || '',
          specialties: (m.specialties || []).join(', '),
          bio: m.bio || '',
          email: m.email || '',
          phone: m.phone || '',
          isActive: !!m.isActive,
          order: m.order || 0,
          socialMedia: {
            linkedin: m.socialMedia?.linkedin || '',
            instagram: m.socialMedia?.instagram || '',
            twitter: m.socialMedia?.twitter || '',
            facebook: m.socialMedia?.facebook || '',
          },
        });
      } else {
        alert('Failed to load member');
      }
    } catch (e) {
      console.error(e);
      alert('Error loading member');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        specialties: form.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push('/admin/teams');
      } else {
        const err = await res.json().catch(() => ({}));
        alert('Failed to update: ' + (err.message || res.statusText));
      }
    } catch (error) {
      console.error('Update failed', error);
      alert('Update failed');
    }
  };

  if (status === 'loading' || loading) return null;
  if (!session || session.user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="container mx-auto px-4">
          <Card className="card-adventure">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Edit Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="teamType">Team Type</Label>
                    <Select value={form.teamType} onValueChange={(value: 'Founders' | 'Core Team') => setForm({ ...form, teamType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Founders">Founders</SelectItem>
                        <SelectItem value="Core Team">Core Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Input id="experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g., 5+ years" />
                  </div>
                  <ImageUpload
                     label="Profile Image"
                     value={form.image}
                     onChange={(url) => setForm({ ...form, image: url })}
                     placeholder="https://example.com/profile-image.jpg"
                   />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialties">Specialties</Label>
                    <Input id="specialties" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} placeholder="Comma-separated" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>LinkedIn</Label>
                    <Input value={form.socialMedia.linkedin} onChange={(e) => setForm({ ...form, socialMedia: { ...form.socialMedia, linkedin: e.target.value } })} />
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    <Input value={form.socialMedia.instagram} onChange={(e) => setForm({ ...form, socialMedia: { ...form.socialMedia, instagram: e.target.value } })} />
                  </div>
                  <div>
                    <Label>Twitter</Label>
                    <Input value={form.socialMedia.twitter} onChange={(e) => setForm({ ...form, socialMedia: { ...form.socialMedia, twitter: e.target.value } })} />
                  </div>
                  <div>
                    <Label>Facebook</Label>
                    <Input value={form.socialMedia.facebook} onChange={(e) => setForm({ ...form, socialMedia: { ...form.socialMedia, facebook: e.target.value } })} />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => router.push('/admin/teams')}>Cancel</Button>
                  <Button type="submit"><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}