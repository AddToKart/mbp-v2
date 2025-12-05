"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  UsersIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  EnvelopeIcon,
  UserIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useValidation } from "@/hooks/useValidation";
import { userSchema, UserFormData } from "@/lib/schemas";
import { useConfirmModal } from "@/components/ui/confirm-modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { confirm, ConfirmModal } = useConfirmModal();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
  });

  const { errors, validate, validateField, clearErrors, setErrors } =
    useValidation(userSchema);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  async function fetchUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    // For edits, password is optional if empty
    const schemaToValidate = editingId
      ? userSchema.partial({ password: true })
      : userSchema;

    // We can't use the hook's validate directly if we need partial validation logic
    // So we'll manually check or just rely on the hook if we adjust the schema dynamically
    // But for simplicity, let's just use the hook's validate and handle the password edge case manually or via schema refinement
    // Actually, the schema defined password as optional().or(literal("")), so it should be fine for edits if empty.
    // However, for CREATE, password is required.

    if (!editingId && !formData.password) {
      setErrors({ ...errors, password: "Password is required for new users" });
      return;
    }

    if (!validate(formData)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingId
        ? `${API_BASE_URL}/admin/users/${editingId}`
        : `${API_BASE_URL}/admin/users`;

      const method = editingId ? "PUT" : "POST";

      // Don't send empty password on update
      const bodyData = { ...formData };
      if (editingId && !bodyData.password) {
        delete bodyData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number, userName: string) {
    setDeleteError(null);

    await confirm({
      title: "Delete User",
      message: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete user");
        }

        setUsers(users.filter((u) => u.id !== id));
      },
    });
  }

  function resetForm() {
    setFormData({ name: "", email: "", password: "" });
    setEditingId(null);
    setIsFormOpen(false);
    setError(null);
    clearErrors();
  }

  function handleEdit(user: User) {
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't populate password
    });
    setEditingId(user.id);
    setIsFormOpen(true);
    clearErrors();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">
            Manage system administrators and users
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="gap-2"
          disabled={isFormOpen && !editingId}
        >
          <PlusIcon className="w-5 h-5" />
          Add User
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/20 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>{editingId ? "Edit User" : "New User"}</CardTitle>
                <CardDescription>
                  {editingId
                    ? "Update user details"
                    : "Create a new administrator account"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, name: val });
                            validateField("name", val);
                          }}
                          placeholder="John Doe"
                          className={`pl-10 ${
                            errors.name ? "border-destructive" : ""
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, email: val });
                            validateField("email", val);
                          }}
                          placeholder="john@example.com"
                          className={`pl-10 ${
                            errors.email ? "border-destructive" : ""
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">
                        Password {editingId && "(Leave blank to keep current)"}
                      </label>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ ...formData, password: val });
                            validateField("password", val);
                          }}
                          placeholder={
                            editingId ? "••••••••" : "Enter a secure password"
                          }
                          className={`pl-10 ${
                            errors.password ? "border-destructive" : ""
                          }`}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CheckIcon className="w-4 h-4 mr-2" />
                    )}
                    {editingId ? "Update User" : "Create User"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <motion.div
            key={user.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    Admin
                  </Badge>
                  <span>
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  className="h-8 w-8 p-0"
                >
                  <PencilSquareIcon className="w-4 h-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(user.id, user.name)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                >
                  <TrashIcon className="w-4 h-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No users found. Create one to get started.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {ConfirmModal}
    </div>
  );
}
