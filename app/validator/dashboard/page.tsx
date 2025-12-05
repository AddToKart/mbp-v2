"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSecureFetch } from "@/contexts/AuthContext";
import { ApplicationResponse } from "@/types/shared";
import { format } from "date-fns";
import { motion } from "@/lib/motion";
import {
    ClockIcon,
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    ChevronRightIcon,
    DocumentMagnifyingGlassIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export default function ValidatorDashboard() {
    const [applications, setApplications] = useState<ApplicationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const secureFetch = useSecureFetch();

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            setError(null);
            const res = await secureFetch(`${API_BASE_URL}/validator/queue`);
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            } else {
                const err = await res.json();
                setError(err.message || "Failed to load queue");
            }
        } catch (err) {
            console.error("Failed to fetch queue", err);
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Application Queue
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Review and process citizen registration applications
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                        {applications.length} pending review{applications.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Reviews</p>
                            <p className="text-2xl font-bold text-gray-900">—</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <DocumentMagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg. Processing</p>
                            <p className="text-2xl font-bold text-gray-900">—</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={fetchQueue}
                        className="ml-auto text-sm font-medium text-red-600 hover:text-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Applications Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Pending Applications</h2>
                </div>

                {applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <DocumentMagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No pending applications</h3>
                        <p className="text-gray-500 text-center max-w-sm">
                            All caught up! New applications will appear here when citizens submit their registration.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {applications.map((app, idx) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                            >
                                <Link
                                    href={`/validator/application/${app.id}`}
                                    className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50 transition-colors group"
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {app.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                {app.fullName || "Unknown"}
                                            </h3>
                                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 whitespace-nowrap">
                                                Pending Review
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <EnvelopeIcon className="h-4 w-4" />
                                                {app.userEmail}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <CalendarIcon className="h-4 w-4" />
                                                {format(new Date(app.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Application ID & Arrow */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            #{app.id.toString().padStart(4, '0')}
                                        </span>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
