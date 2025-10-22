"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  UserIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      // Check if admin or citizen based on email domain
      if (email.toLowerCase().includes("@admin")) {
        // Admin login
        localStorage.setItem(
          "user",
          JSON.stringify({
            email,
            role: "admin",
            name: "Admin User",
          })
        );
        router.push("/admin");
      } else if (email.toLowerCase().includes("@citizen")) {
        // Citizen login
        localStorage.setItem(
          "user",
          JSON.stringify({
            email,
            role: "citizen",
            name: "Citizen User",
          })
        );
        router.push("/");
      } else {
        setError("Please use @admin or @citizen email domain");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="w-full max-w-6xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <motion.div
            className="hidden md:block space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <Link href="/" className="inline-block">
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">SM</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-2xl text-foreground">
                      Santa Maria
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Municipal Government
                    </p>
                  </div>
                </motion.div>
              </Link>

              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Welcome Back! 👋
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Access your municipal portal to manage services, view
                announcements, and stay connected with your community.
              </p>
            </div>

            <div className="space-y-4">
              <motion.div
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
                whileHover={{ scale: 1.02, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BuildingOffice2Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Admin Access
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use @admin domain to manage content, view analytics, and
                    administer the portal.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
                whileHover={{ scale: 1.02, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Citizen Portal
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use @citizen domain to access personalized services and
                    community features.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Secured with end-to-end encryption</span>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Sign In</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Portal Access
                  </Badge>
                </div>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <EnvelopeIcon className="w-5 h-5" />
                      </div>
                      <Input
                        type="email"
                        placeholder="name@admin or name@citizen"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use @admin or @citizen domain
                    </p>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <LockClosedIcon className="w-5 h-5" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                      >
                        <p className="text-sm text-destructive font-medium">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-input" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <Link
                      href="#"
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Demo Credentials
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Admin
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        admin@admin
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Citizen
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        user@citizen
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to Homepage
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
