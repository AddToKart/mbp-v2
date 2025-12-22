"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UsersIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  EnvelopeIcon,
  UserIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirmModal } from "@/components/ui/confirm-modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "validator" | "citizen";
  verificationStatus: "none" | "pending" | "approved" | "rejected" | "needs_info";
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  admins: number;
  validators: number;
  citizens: number;
  approved: number;
  pending: number;
  rejected: number;
  unverified: number;
}

interface PaginatedResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "validator" | "citizen";
  verificationStatus: "none" | "pending" | "approved" | "rejected";
}

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admins" },
  { value: "validator", label: "Validators" },
  { value: "citizen", label: "Citizens" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "none", label: "Unverified" },
  { value: "rejected", label: "Rejected" },
];

const ROLE_FORM_OPTIONS = [
  { value: "citizen", label: "Citizen" },
  { value: "validator", label: "Validator" },
  { value: "admin", label: "Administrator" },
];

const STATUS_FORM_OPTIONS = [
  { value: "none", label: "Unverified" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type ViewMode = "list" | "card";

export default function AdminUsersPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmModal } = useConfirmModal();

  // Pagination & filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "citizen",
    verificationStatus: "none",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data: PaginatedResponse = await response.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page, limit, roleFilter, statusFilter, debouncedSearch]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch { }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      fetchUsers();
      fetchStats();
    }
  }, [authLoading, isAuthenticated, fetchUsers, fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    else if (formData.name.length < 2) errors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";

    if (!editingUser && !formData.password) errors.password = "Password is required";
    else if (formData.password && formData.password.length < 8) errors.password = "Password must be at least 8 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated || !validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingUser
        ? `${API_BASE_URL}/admin/users/${editingUser.id}`
        : `${API_BASE_URL}/admin/users`;

      const method = editingUser ? "PUT" : "POST";
      const bodyData: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        verificationStatus: formData.verificationStatus,
      };

      if (formData.password) {
        bodyData.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      await fetchUsers();
      await fetchStats();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(user: User) {
    await confirm({
      title: "Delete User",
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete user");
        }

        await fetchUsers();
        await fetchStats();
      },
    });
  }

  function resetForm() {
    setFormData({ name: "", email: "", password: "", role: "citizen", verificationStatus: "none" });
    setEditingUser(null);
    setIsFormOpen(false);
    setError(null);
    setFormErrors({});
  }

  function handleEdit(user: User) {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      verificationStatus: user.verificationStatus === "needs_info" ? "pending" : user.verificationStatus,
    });
    setEditingUser(user);
    setIsFormOpen(true);
    setFormErrors({});
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-blue-600 text-white",
      validator: "bg-violet-600 text-white",
      citizen: "bg-slate-500 text-white",
    };
    return styles[role as keyof typeof styles] || styles.citizen;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-emerald-600 text-white",
      pending: "bg-amber-500 text-white",
      rejected: "bg-red-600 text-white",
      none: "bg-slate-400 text-white",
      needs_info: "bg-orange-500 text-white",
    };
    return styles[status as keyof typeof styles] || styles.none;
  };

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage system users and accounts</p>
        </div>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="gap-2">
          <PlusIcon className="w-5 h-5" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.admins}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Validators</p>
                  <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.validators}</h3>
                </div>
                <div className="p-3 rounded-full bg-violet-500/10">
                  <UserGroupIcon className="w-5 h-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Citizens</p>
                  <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.citizens}</h3>
                </div>
                <div className="p-3 rounded-full bg-slate-500/10">
                  <UsersIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold mt-1 text-foreground">{stats.pending}</h3>
                </div>
                <div className="p-3 rounded-full bg-amber-500/10">
                  <ClockIcon className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">User Directory</CardTitle>
              <CardDescription>
                {total > 0 ? `${total.toLocaleString()} total users` : "No users found"}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64 h-9 border-0 bg-muted/50 focus-visible:bg-background"
                />
              </div>
              <div className="flex gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-muted/50 rounded-md p-1">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-7 px-2"
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "card" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("card")}
                    className="h-7 px-2"
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </Button>
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 rounded-md bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer border-0"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-md bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer border-0"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* List View (Table) */}
          {viewMode === "list" && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-0">
                  <TableHead className="w-[35%] font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i} className="border-0">
                      <TableCell><div className="h-10 w-48 bg-muted/30 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted/30 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted/30 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-6 w-24 bg-muted/30 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-8 w-16 bg-muted/30 rounded animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow className="border-0">
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>{debouncedSearch || roleFilter !== "all" || statusFilter !== "all"
                        ? "No users match your filters"
                        : "No users found"}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="hover:bg-muted/20 border-0"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize border-0 ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize border-0 ${getStatusBadge(user.verificationStatus)}`}>
                          {user.verificationStatus === "none" ? "Unverified" : user.verificationStatus.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0"
                          >
                            <PencilSquareIcon className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10"
                          >
                            <TrashIcon className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0 bg-muted/30">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
                          <div className="h-3 w-40 bg-muted/50 rounded animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : users.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No users found</p>
                </div>
              ) : (
                users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card className="h-full border-0 bg-muted/30 hover:bg-muted/50 transition-colors group flex flex-col">
                      <CardContent className="p-4 flex flex-col flex-1">
                        {/* User Info */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(user)}>
                              <PencilSquareIcon className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-destructive/10" onClick={() => handleDelete(user)}>
                              <TrashIcon className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`capitalize border-0 ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </Badge>
                          <Badge className={`capitalize border-0 ${getStatusBadge(user.verificationStatus)}`}>
                            {user.verificationStatus === "none" ? "Unverified" : user.verificationStatus.replace("_", " ")}
                          </Badge>
                        </div>

                        {/* Footer */}
                        <div className="pt-3 mt-auto border-t border-border/50 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                          Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {total.toLocaleString()} users
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="h-8 rounded-md bg-background px-2 text-sm border-0 shadow-sm"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingUser ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? `Editing ${editingUser.name} • Joined ${new Date(editingUser.createdAt).toLocaleDateString()}`
                : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className={`pl-9 border-0 bg-muted/50 focus-visible:bg-background ${formErrors.name ? "ring-2 ring-destructive" : ""}`}
                  />
                </div>
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className={`pl-9 border-0 bg-muted/50 focus-visible:bg-background ${formErrors.email ? "ring-2 ring-destructive" : ""}`}
                  />
                </div>
                {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
              </div>
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserFormData["role"] })}
                  className="w-full h-10 rounded-md bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border-0"
                >
                  {ROLE_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Status</label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as UserFormData["verificationStatus"] })}
                  className="w-full h-10 rounded-md bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border-0"
                >
                  {STATUS_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Password {editingUser && <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "••••••••" : "Minimum 8 characters"}
                  className={`pl-9 border-0 bg-muted/50 focus-visible:bg-background ${formErrors.password ? "ring-2 ring-destructive" : ""}`}
                />
              </div>
              {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
            </div>

            {/* User Info (when editing) */}
            {editingUser && (
              <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Account Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>Created: {new Date(editingUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span>Updated: {new Date(editingUser.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={resetForm} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {editingUser ? "Save Changes" : "Create User"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {ConfirmModal}
    </div>
  );
}
