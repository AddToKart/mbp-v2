"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSecureFetch } from "@/contexts/AuthContext";
import { ApplicationResponse } from "@/types/shared";
import { format } from "date-fns";
import Link from "next/link";
import { motion } from "@/lib/motion";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    QuestionMarkCircleIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    EnvelopeIcon,
    IdentificationIcon,
    CameraIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export default function ApplicationReviewPage() {
    const params = useParams();
    const router = useRouter();
    const secureFetch = useSecureFetch();
    const [app, setApp] = useState<ApplicationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) fetchApplication(params.id as string);
    }, [params.id]);

    const fetchApplication = async (id: string) => {
        try {
            const res = await secureFetch(`${API_BASE_URL}/validator/application/${id}`);
            if (res.ok) {
                setApp(await res.json());
            } else {
                const errData = await res.json();
                setError(errData.message || "Failed to load application");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: "approve" | "reject" | "request_info") => {
        if (!app) return;
        if (action === "reject" && !notes) {
            alert("Please provide a reason for rejection.");
            return;
        }

        const actionLabels = {
            approve: "approve",
            reject: "reject",
            request_info: "request more information for"
        };

        if (!confirm(`Are you sure you want to ${actionLabels[action]} this application?`)) return;

        setSubmitting(true);
        try {
            const res = await secureFetch(`${API_BASE_URL}/validator/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: app.id,
                    action,
                    notes
                })
            });

            if (res.ok) {
                const actionPast = action === "approve" ? "approved" : action === "reject" ? "rejected" : "updated";
                alert(`Application ${actionPast} successfully!`);
                router.push("/validator/dashboard");
            } else {
                const err = await res.json();
                alert(err.message || "Action failed");
            }
        } catch (e) {
            alert("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading application...</p>
                </div>
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircleIcon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{error || "Application not found"}</h3>
                <Link
                    href="/validator/dashboard"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    const aiData = app.aiAnalysisJson ? JSON.parse(app.aiAnalysisJson) : null;

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        approved: "bg-green-100 text-green-800 border-green-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
        needs_info: "bg-orange-100 text-orange-800 border-orange-200",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
        >
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <Link
                        href="/validator/dashboard"
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors w-fit"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Back to Queue</span>
                    </Link>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Application #{app.id.toString().padStart(4, '0')}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border ${statusColors[app.status as keyof typeof statusColors] || statusColors.pending}`}>
                                {app.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="mt-1 text-gray-500">
                            Submitted on {format(new Date(app.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal Info & ID */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                    {app.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</p>
                                        <p className="mt-1 text-gray-900 font-medium">{app.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <EnvelopeIcon className="h-3 w-3" /> Email
                                        </p>
                                        <p className="mt-1 text-gray-900">{app.userEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <PhoneIcon className="h-3 w-3" /> Phone
                                        </p>
                                        <p className="mt-1 text-gray-900">{app.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" /> Date of Birth
                                        </p>
                                        <p className="mt-1 text-gray-900">{format(new Date(app.dob), "MMMM d, yyyy")}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <MapPinIcon className="h-3 w-3" /> Address
                                        </p>
                                        <p className="mt-1 text-gray-900">{app.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ID Documents Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <IdentificationIcon className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">ID Documents</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Front of ID</p>
                                {app.idCardFront ? (
                                    <img
                                        src={app.idCardFront}
                                        alt="Front ID"
                                        className="w-full rounded-xl border border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                        Not provided
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Back of ID</p>
                                {app.idCardBack ? (
                                    <img
                                        src={app.idCardBack}
                                        alt="Back ID"
                                        className="w-full rounded-xl border border-gray-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                        Not provided
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Face Verification Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <CameraIcon className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">Face Verification</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-3">Selfie Capture</p>
                                    {app.selfieImage ? (
                                        <img
                                            src={app.selfieImage}
                                            alt="Selfie"
                                            className="w-full rounded-xl border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                            Not provided
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-3">AI Analysis</p>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full">
                                        {aiData ? (
                                            <ul className="space-y-3">
                                                <li className="flex items-center justify-between">
                                                    <span className="text-gray-600">Liveness Check</span>
                                                    <span className="flex items-center gap-1 text-green-600 font-medium">
                                                        <CheckCircleIcon className="h-4 w-4" /> Passed
                                                    </span>
                                                </li>
                                                <li className="flex items-center justify-between">
                                                    <span className="text-gray-600">Face Match Score</span>
                                                    <span className="font-medium text-gray-900">
                                                        {(aiData.faceScore * 100).toFixed(1)}%
                                                    </span>
                                                </li>
                                                <li className="flex items-center justify-between">
                                                    <span className="text-gray-600">Confidence</span>
                                                    <span className={`font-medium ${aiData.faceScore > 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {aiData.faceScore > 0.7 ? 'High' : 'Medium'}
                                                    </span>
                                                </li>
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 italic text-center py-8">No AI analysis available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Validator Actions</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes / Rejection Reason
                                </label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 p-3 text-sm resize-none"
                                    placeholder="Add notes for this application..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleAction("approve")}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Approve Application
                                </button>
                                <button
                                    onClick={() => handleAction("request_info")}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <QuestionMarkCircleIcon className="h-5 w-5" />
                                    Request More Info
                                </button>
                                <button
                                    onClick={() => handleAction("reject")}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <XCircleIcon className="h-5 w-5" />
                                    Reject Application
                                </button>
                            </div>

                            {submitting && (
                                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                    Processing...
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
