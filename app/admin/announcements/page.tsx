"use client";

import { motion } from "@/lib/motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MegaphoneIcon } from "@heroicons/react/24/outline";

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Announcements
        </h1>
        <p className="text-muted-foreground">
          Manage official municipal announcements and bulletins
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
              <MegaphoneIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              This feature is currently under development and will be available
              soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}
