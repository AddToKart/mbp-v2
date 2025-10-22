"use client";

import { motion } from "@/lib/motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UsersIcon } from "@heroicons/react/24/outline";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
        <p className="text-muted-foreground">
          Manage citizen and admin user accounts
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UsersIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              User management functionality will be available shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}
