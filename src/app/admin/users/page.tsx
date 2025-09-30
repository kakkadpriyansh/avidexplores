"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  UserCog,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  UserX,
  Crown,
  Users as UsersIcon,
} from "lucide-react";

interface IUserItem {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "GUIDE";
  isVerified?: boolean;
  isBanned?: boolean;
  isActive?: boolean;
  banReason?: string;
  createdAt?: string;
}

interface UsersResponse {
  users: IUserItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
  statistics?: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    unverifiedUsers: number;
    adminUsers: number;
    guideUsers: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<IUserItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [stats, setStats] = useState<UsersResponse["statistics"]>();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login?callbackUrl=/admin/users");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, page, role, statusFilter, sortBy, sortOrder]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (search.trim()) params.set("search", search.trim());
    if (role !== "ALL") params.set("role", role);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    return params.toString();
  }, [page, limit, search, role, statusFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Prefer the richer admin endpoint
      const res = await fetch(`/api/admin/users?${queryString}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: UsersResponse = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
      setStats(data.statistics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const doUserAction = async (
    userId: string,
    action:
      | "ban"
      | "unban"
      | "verify"
      | "unverify"
      | "changeRole"
      | "activate"
      | "deactivate",
    payload?: { reason?: string; role?: "USER" | "ADMIN" | "GUIDE" }
  ) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!res.ok) throw new Error("Action failed");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to perform action");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const StatusBadges = ({ u }: { u: IUserItem }) => (
    <div className="flex items-center gap-2">
      {u.isActive === false && (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
      )}
      {u.isVerified ? (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
        </Badge>
      ) : (
        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5" /> Unverified
        </Badge>
      )}
      {u.isBanned && (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <Ban className="h-3.5 w-3.5" /> Banned
        </Badge>
      )}
    </div>
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-product-sans font-bold text-foreground mb-2">User Management</h1>
              <p className="text-muted-foreground">Search, filter, and manage platform users</p>
            </div>
            <Button onClick={() => router.push("/admin")}>Back to Dashboard</Button>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="card-adventure"><CardContent className="p-4"><div className="text-sm text-muted-foreground">Total Users</div><div className="text-2xl font-bold">{stats.totalUsers}</div></CardContent></Card>
              <Card className="card-adventure"><CardContent className="p-4"><div className="text-sm text-muted-foreground">Active</div><div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div></CardContent></Card>
              <Card className="card-adventure"><CardContent className="p-4"><div className="text-sm text-muted-foreground">Banned</div><div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div></CardContent></Card>
              <Card className="card-adventure"><CardContent className="p-4"><div className="text-sm text-muted-foreground">Unverified</div><div className="text-2xl font-bold text-yellow-600">{stats.unverifiedUsers}</div></CardContent></Card>
            </div>
          )}

          {/* Filters */}
          <Card className="card-adventure mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setPage(1);
                          fetchUsers();
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                  <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="GUIDE">Guide</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={`${sortBy}:${sortOrder}`} onValueChange={(v) => {
                    const [sb, so] = v.split(":");
                    setSortBy(sb); setSortOrder(so as "asc" | "desc");
                  }}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Sort" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt:desc">Newest</SelectItem>
                      <SelectItem value="createdAt:asc">Oldest</SelectItem>
                      <SelectItem value="name:asc">Name A-Z</SelectItem>
                      <SelectItem value="name:desc">Name Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setSearch(""); setRole("ALL"); setStatusFilter("ALL"); setSortBy("createdAt"); setSortOrder("desc"); setPage(1); fetchUsers(); }}>Reset</Button>
                  <Button onClick={() => { setPage(1); fetchUsers(); }}>Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="card-adventure">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UsersIcon className="h-5 w-5" /> Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No users found</TableCell>
                    </TableRow>
                  )}
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.name || "-"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {u.role === "ADMIN" && <Crown className="h-4 w-4 text-yellow-600" />}
                          {u.role}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadges u={u} /></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {u.isBanned ? (
                              <DropdownMenuItem onClick={() => doUserAction(u._id, "unban")}> <UserCheck className="h-4 w-4 mr-2" /> Unban</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => {
                                const reason = prompt("Ban reason (required)") || "";
                                if (!reason.trim()) return;
                                doUserAction(u._id, "ban", { reason });
                              }}> <UserX className="h-4 w-4 mr-2" /> Ban</DropdownMenuItem>
                            )}
                            {u.isVerified ? (
                              <DropdownMenuItem onClick={() => doUserAction(u._id, "unverify")}> <XCircle className="h-4 w-4 mr-2" /> Mark Unverified</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => doUserAction(u._id, "verify")}> <CheckCircle2 className="h-4 w-4 mr-2" /> Verify</DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => doUserAction(u._id, "changeRole", { role: "USER" })}><UserCog className="h-4 w-4 mr-2" /> Set User</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => doUserAction(u._id, "changeRole", { role: "GUIDE" })}><ShieldCheck className="h-4 w-4 mr-2" /> Set Guide</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => doUserAction(u._id, "changeRole", { role: "ADMIN" })}><Crown className="h-4 w-4 mr-2" /> Set Admin</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(u._id)}>
                              <Ban className="h-4 w-4 mr-2" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.max(1, p - 1));
                          }}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.min(totalPages, p + 1));
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}