"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "@/lib/motion";
import { format } from "date-fns";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    FunnelIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

interface Application {
    id: number;
    userId: number;
    fullName: string;
    userEmail: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "approved" | "rejected" | "needs_info">("all");
    const [reopeningId, setReopeningId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, [filter]);

    async function fetchHistory() {
        setIsLoading(true);
        setError(null);
        try {
            const url = filter === "all"
                ? `${API_URL}/validator/history`
                : `${API_URL}/validator/history?status=${filter}`;

            const response = await fetch(url, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch history");
            }

            const data = await response.json();
            setApplications(data);
        } catch (err) {
            setError("Failed to load application history");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleReopen(applicationId: number) {
        setReopeningId(applicationId);
        try {
            const response = await fetch(`${API_URL}/validator/application/${applicationId}/reopen`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to reopen application");
            }

            // Remove from the list (it's now back in the pending queue)
            setApplications(prev => prev.filter(app => app.id !== applicationId));
        } catch (err) {
            setError("Failed to reopen application");
            console.error(err);
        } finally {
            setReopeningId(null);
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                        Rejected
                    </Badge>
                );
            case "needs_info":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                        <ExclamationTriangleIcon className="w-3.5 h-3.5 mr-1" />
                        Needs Info
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "bg-green-500";
            case "rejected": return "bg-red-500";
            case "needs_info": return "bg-yellow-500";
            default: return "bg-gray-500";
        }
    };

    const stats = {
        total: applications.length,
        approved: applications.filter(a => a.status === "approved").length,
        rejected: applications.filter(a => a.status === "rejected").length,
        needsInfo: applications.filter(a => a.status === "needs_info").length,
    };

    const getFilterTitle = () => {
        switch (filter) {
            case "approved": return "Approved Applications";
            case "rejected": return "Rejected Applications";
            case "needs_info": return "Needs Info Applications";
            default: return "All Reviewed Applications";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Application History</h1>
                    <p className="text-muted-foreground">
                        View and manage reviewed applications
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                    className={`cursor-pointer transition-all ${filter === "all" ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                    onClick={() => setFilter("all")}
                >
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <ClockIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${filter === "approved" ? "ring-2 ring-green-500" : "hover:shadow-md"}`}
                    onClick={() => setFilter("approved")}
                >
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${filter === "rejected" ? "ring-2 ring-red-500" : "hover:shadow-md"}`}
                    onClick={() => setFilter("rejected")}
                >
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <XCircleIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${filter === "needs_info" ? "ring-2 ring-yellow-500" : "hover:shadow-md"}`}
                    onClick={() => setFilter("needs_info")}
                >
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Needs Info</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.needsInfo}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {getFilterTitle()}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter("all")}
                            className={filter === "all" ? "hidden" : ""}
                        >
                            <FunnelIcon className="w-4 h-4 mr-1" />
                            Clear Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No reviewed applications found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getStatusColor(app.status)}`}>
                                            {app.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-foreground">{app.fullName}</p>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {app.userEmail} • App #{app.id}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Reviewed: {format(new Date(app.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReopen(app.id)}
                                            disabled={reopeningId === app.id}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {reopeningId === app.id ? (
                                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                                                    Re-review
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/validator/application/${app.id}`)}
                                        >
                                            View
                                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
