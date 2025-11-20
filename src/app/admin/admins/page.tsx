"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, Shield, MoreVertical, Trash2, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUB_ADMIN";
  permissions?: string[];
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "events", label: "Events Management" },
  { id: "bookings", label: "Bookings Management" },
  { id: "users", label: "Users Management" },
  { id: "inquiries", label: "Inquiries Management" },
  { id: "testimonials", label: "Testimonials Management" },
  { id: "hero", label: "Hero Section Management" },
  { id: "destinations", label: "Destination Cards Management" },
  { id: "teams", label: "Teams Management" },
];

export default function AdminsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", permissions: [] as string[] });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUB_ADMIN")) {
      router.push("/admin");
      return;
    }
    if (session.user.role === "ADMIN") {
      fetchAdmins();
    } else {
      router.push("/admin");
    }
  }, [session, status]);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createSubAdmin = async () => {
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to create sub-admin");
        return;
      }
      setDialogOpen(false);
      setFormData({ name: "", email: "", password: "", permissions: [] });
      fetchAdmins();
    } catch (e) {
      alert("Failed to create sub-admin");
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    try {
      await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      fetchAdmins();
    } catch (e) {
      alert("Failed to delete admin");
    }
  };

  const updatePermissions = async () => {
    if (!editingAdmin) return;
    try {
      const res = await fetch(`/api/admin/admins/${editingAdmin._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: editingAdmin.permissions }),
      });
      if (!res.ok) {
        alert("Failed to update permissions");
        return;
      }
      setEditDialogOpen(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (e) {
      alert("Failed to update permissions");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Management</h1>
            <p className="text-muted-foreground">Manage admins and sub-admins</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Create Sub-Admin</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Sub-Admin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-3 block">Permissions</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_PERMISSIONS.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={formData.permissions.includes(perm.id)}
                            onCheckedChange={(checked) => {
                              setFormData({
                                ...formData,
                                permissions: checked
                                  ? [...formData.permissions, perm.id]
                                  : formData.permissions.filter((p) => p !== perm.id),
                              });
                            }}
                          />
                          <label htmlFor={perm.id} className="text-sm cursor-pointer">{perm.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={createSubAdmin} className="w-full">Create Sub-Admin</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => router.push("/admin")}>Back to Dashboard</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admins & Sub-Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === "ADMIN" ? "default" : "secondary"}>
                        {admin.role === "ADMIN" ? <Crown className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                        {admin.role === "ADMIN" ? "Admin" : "Sub-Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.role === "ADMIN" ? (
                        <span className="text-sm text-muted-foreground">All Permissions</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions?.map((p) => (
                            <Badge key={p} variant="outline" className="text-xs">{AVAILABLE_PERMISSIONS.find((ap) => ap.id === p)?.label}</Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {admin.role === "SUB_ADMIN" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingAdmin(admin); setEditDialogOpen(true); }}>
                              <Shield className="h-4 w-4 mr-2" />Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteAdmin(admin._id)}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Permissions - {editingAdmin?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Permissions</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${perm.id}`}
                        checked={editingAdmin?.permissions?.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          if (!editingAdmin) return;
                          setEditingAdmin({
                            ...editingAdmin,
                            permissions: checked
                              ? [...(editingAdmin.permissions || []), perm.id]
                              : (editingAdmin.permissions || []).filter((p) => p !== perm.id),
                          });
                        }}
                      />
                      <label htmlFor={`edit-${perm.id}`} className="text-sm cursor-pointer">{perm.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={updatePermissions} className="w-full">Update Permissions</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
