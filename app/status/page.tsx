"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { XMarkIcon, PencilIcon, CameraIcon, PhotoIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

interface PreviousApplication {
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    address: string;
    phone: string;
    dob: string;
    idCardFront?: string;
    idCardBack?: string;
    selfieImage?: string;
}

export default function StatusPage() {
    const { user, isLoading, refreshSession } = useAuth();
    const router = useRouter();
    const [showReapplyDialog, setShowReapplyDialog] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [previousApp, setPreviousApp] = useState<PreviousApplication | null>(null);
    const [isReapplying, setIsReapplying] = useState(false);
    const [loadingPrevApp, setLoadingPrevApp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        phone: "",
        dob: "",
    });
    const [newIdFront, setNewIdFront] = useState<string | null>(null);
    const [newIdBack, setNewIdBack] = useState<string | null>(null);
    const [newSelfie, setNewSelfie] = useState<string | null>(null);

    // Camera state
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const idFrontRef = useRef<HTMLInputElement>(null);
    const idBackRef = useRef<HTMLInputElement>(null);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [isLoading, user, router]);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 }
            });
            setCameraStream(stream);
            setShowCamera(true);

            // Attach stream to video element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            setError("Could not access camera. Please check permissions.");
            console.error(err);
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
    }, [cameraStream]);

    // Capture photo from camera
    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                setNewSelfie(dataUrl);
                stopCamera();
            }
        }
    }, [stopCamera]);

    // Fetch previous application
    async function fetchPreviousApplication() {
        setLoadingPrevApp(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/register/previous-application`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch previous application");
            }

            const data = await response.json();
            setPreviousApp(data);
            setEditForm({
                firstName: data.firstName || "",
                middleName: data.middleName || "",
                lastName: data.lastName || "",
                address: data.address || "",
                phone: data.phone || "",
                dob: data.dob || "",
            });
            setShowReapplyDialog(true);
        } catch (err) {
            setError("Failed to load previous application data");
            console.error(err);
        } finally {
            setLoadingPrevApp(false);
        }
    }

    // Handle quick reapplication (no changes)
    async function handleReapply() {
        setIsReapplying(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/register/reapply`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Reapplication failed");
            }

            await refreshSession();
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to reapply");
            console.error(err);
        } finally {
            setIsReapplying(false);
        }
    }

    // Handle reapplication with edits
    async function handleReapplyWithChanges() {
        setIsReapplying(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/register/reapply-with-changes`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...editForm,
                    idCardFront: newIdFront,
                    idCardBack: newIdBack,
                    selfieImage: newSelfie,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Reapplication failed");
            }

            await refreshSession();
            setShowEditModal(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to reapply");
            console.error(err);
        } finally {
            setIsReapplying(false);
        }
    }

    // Handle file upload
    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            if (type === "front") setNewIdFront(base64);
            else setNewIdBack(base64);
        };
        reader.readAsDataURL(file);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500">Redirecting...</p>
                </div>
            </div>
        );
    }

    const { verificationStatus, rejectionReason } = user;

    const renderContent = () => {
        switch (verificationStatus) {
            case "approved":
                return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-700 mb-2">Account Verified!</h2>
                        <p className="text-gray-600 mb-6">Create posts, access services, and more.</p>
                        <Button onClick={() => router.push("/portal")}>Go to Portal</Button>
                    </div>
                );

            case "rejected":
                return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-700 mb-2">Application Rejected</h2>
                        <p className="text-gray-600 mb-4">Unfortunately, your application was not approved.</p>

                        {rejectionReason && (
                            <div className="bg-red-50 p-4 rounded-lg text-left mb-6">
                                <p className="text-sm font-semibold text-red-800 mb-1">Reason:</p>
                                <p className="text-sm text-red-700">{rejectionReason}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        {!showReapplyDialog ? (
                            <Button
                                onClick={fetchPreviousApplication}
                                disabled={loadingPrevApp}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loadingPrevApp ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Loading...
                                    </div>
                                ) : (
                                    "Re-apply Now"
                                )}
                            </Button>
                        ) : previousApp && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-xl text-left">
                                    <p className="text-sm font-semibold text-blue-800 mb-3">
                                        Your previous application details:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Name</p>
                                            <p className="font-medium text-gray-800">{previousApp.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{previousApp.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-800">{previousApp.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Date of Birth</p>
                                            <p className="font-medium text-gray-800">
                                                {previousApp.dob ? format(new Date(previousApp.dob), "MMM d, yyyy") : "-"}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-500">Address</p>
                                            <p className="font-medium text-gray-800">{previousApp.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowReapplyDialog(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowEditModal(true)}
                                        className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                                    >
                                        <PencilIcon className="w-4 h-4 mr-1" />
                                        Edit & Reapply
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleReapply}
                                    disabled={isReapplying}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {isReapplying ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting...
                                        </div>
                                    ) : (
                                        "Quick Reapply (No Changes)"
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                );

            case "needs_info":
                return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-700 mb-2">Action Required</h2>
                        <p className="text-gray-600 mb-6">We need more information to process your application.</p>
                        <Button onClick={() => router.push("/register/update")}>Update Application</Button>
                    </div>
                );

            case "pending":
            default:
                return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-blue-700 mb-2">Under Review</h2>
                        <p className="text-gray-600">
                            Your application is currently being reviewed by our validators. <br />
                            Please check back later using this page.
                        </p>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader>
                        <CardTitle>Application Status</CardTitle>
                        <CardDescription>
                            Reference: {user.email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderContent()}

                        {/* Continue as Guest Button */}
                        <div className="pt-4">
                            <button
                                onClick={() => router.push("/")}
                                className="w-full py-3 px-4 rounded-xl text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                                ← Continue as Guest
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit & Reapply Modal */}
            {showEditModal && previousApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">Edit & Reapply</h2>
                                <p className="text-blue-100 text-sm">Update your information</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    stopCamera();
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Personal Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <PencilIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Personal Information</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">First Name</label>
                                        <input
                                            type="text"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Middle Name</label>
                                        <input
                                            type="text"
                                            value={editForm.middleName}
                                            onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Last Name</label>
                                        <input
                                            type="text"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editForm.dob}
                                            onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
                                    <textarea
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* ID Documents */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <PhotoIcon className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">ID Documents</h3>
                                        <p className="text-xs text-gray-500">Upload new photos to replace existing ones</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* ID Front */}
                                    <div>
                                        <input
                                            type="file"
                                            ref={idFrontRef}
                                            onChange={(e) => handleFileUpload(e, "front")}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {newIdFront ? (
                                            <div className="relative group">
                                                <img
                                                    src={newIdFront}
                                                    alt="ID Front"
                                                    className="w-full h-28 object-cover rounded-xl border-2 border-green-400"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => idFrontRef.current?.click()}
                                                        className="p-2 bg-white rounded-lg"
                                                    >
                                                        <ArrowPathIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setNewIdFront(null)}
                                                        className="p-2 bg-red-500 text-white rounded-lg"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-2 left-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                                    ID Front ✓
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => idFrontRef.current?.click()}
                                                className="w-full h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                            >
                                                <CameraIcon className="w-6 h-6 text-gray-400" />
                                                <span className="text-xs text-gray-500">Upload ID Front</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* ID Back */}
                                    <div>
                                        <input
                                            type="file"
                                            ref={idBackRef}
                                            onChange={(e) => handleFileUpload(e, "back")}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {newIdBack ? (
                                            <div className="relative group">
                                                <img
                                                    src={newIdBack}
                                                    alt="ID Back"
                                                    className="w-full h-28 object-cover rounded-xl border-2 border-green-400"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => idBackRef.current?.click()}
                                                        className="p-2 bg-white rounded-lg"
                                                    >
                                                        <ArrowPathIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setNewIdBack(null)}
                                                        className="p-2 bg-red-500 text-white rounded-lg"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-2 left-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                                    ID Back ✓
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => idBackRef.current?.click()}
                                                className="w-full h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                            >
                                                <CameraIcon className="w-6 h-6 text-gray-400" />
                                                <span className="text-xs text-gray-500">Upload ID Back</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Face Verification */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CameraIcon className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Face Verification</h3>
                                        <p className="text-xs text-gray-500">Take a new selfie using your camera</p>
                                    </div>
                                </div>

                                {showCamera ? (
                                    <div className="space-y-3">
                                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Face guide overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-48 h-48 border-4 border-white/50 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={stopCamera}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={capturePhoto}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                <CameraIcon className="w-4 h-4 mr-2" />
                                                Capture Photo
                                            </Button>
                                        </div>
                                    </div>
                                ) : newSelfie ? (
                                    <div className="relative group">
                                        <img
                                            src={newSelfie}
                                            alt="Selfie"
                                            className="w-full h-48 object-cover rounded-xl border-2 border-green-400"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                            <button
                                                onClick={startCamera}
                                                className="p-3 bg-white rounded-lg"
                                            >
                                                <ArrowPathIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setNewSelfie(null)}
                                                className="p-3 bg-red-500 text-white rounded-lg"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <span className="absolute bottom-3 left-3 text-sm bg-green-500 text-white px-3 py-1 rounded-full font-medium">
                                            ✓ Selfie Captured
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={startCamera}
                                        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-green-400 hover:bg-green-50 transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                            <CameraIcon className="w-8 h-8 text-gray-400 group-hover:text-green-600" />
                                        </div>
                                        <span className="text-sm text-gray-500 group-hover:text-green-600 font-medium">
                                            Open Camera for Selfie
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t bg-gray-50 p-4 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowEditModal(false);
                                    stopCamera();
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReapplyWithChanges}
                                disabled={isReapplying}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {isReapplying ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </div>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Hidden canvas for capturing */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
        </>
    );
}
