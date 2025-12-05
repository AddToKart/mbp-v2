"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "@/lib/motion";
import RegisterStep1 from "@/components/registration/RegisterStep1";
import RegisterStep2 from "@/components/registration/RegisterStep2";
import RegisterStep3 from "@/components/registration/RegisterStep3";
import {
    type RegisterStep1Request,
    type RegisterStep2Request,
    type RegisterStep3Request,
} from "@/types/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

const STEPS = ["Personal Info", "ID Verification", "Face Verification"];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [token, setToken] = useState<string | null>(null);

    const handleStep1Submit = async (data: RegisterStep1Request) => {
        try {
            const res = await fetch(`${API_BASE_URL}/register/step1`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || "Registration failed");
                return;
            }

            const result = await res.json();
            setToken(result.token);
            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep(2);
        } catch (e) {
            alert("Network error. Please check your connection.");
        }
    };

    const handleStep2Submit = async (data: RegisterStep2Request) => {
        try {
            const res = await fetch(`${API_BASE_URL}/register/step2`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("ID Upload failed");
            }

            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep(3);
        } catch (e) {
            alert("Upload failed. Please try again.");
        }
    };

    const handleStep3Submit = async (data: RegisterStep3Request) => {
        try {
            const res = await fetch(`${API_BASE_URL}/register/step3`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Verification failed");
            }

            setStep(4);
        } catch (e) {
            alert("Submission failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow">
                            <span className="text-white font-bold text-lg">SM</span>
                        </div>
                        <span className="font-semibold text-gray-700">Santa Maria</span>
                    </Link>
                    <h1 className="text-4xl font-extrabold text-blue-900">
                        Citizen Registration
                    </h1>
                    <p className="mt-2 text-gray-600">Create your account to access municipal services</p>
                </motion.div>

                {/* Progress Bar */}
                {step < 4 && (
                    <motion.div
                        className="mb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between max-w-xl mx-auto">
                            {STEPS.map((label, idx) => (
                                <div key={idx} className="flex flex-col items-center flex-1">
                                    <div className="relative flex items-center justify-center w-full">
                                        {idx > 0 && (
                                            <div className={`absolute right-1/2 h-1 w-full -translate-y-px ${step > idx ? 'bg-green-500' : 'bg-gray-200'}`} />
                                        )}
                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                                            ${step > idx + 1 ? "bg-green-500 text-white border-green-500" :
                                                step === idx + 1 ? "bg-blue-600 text-white border-blue-600 shadow-lg" :
                                                    "bg-white text-gray-400 border-gray-300"}`}>
                                            {step > idx + 1 ? "✓" : idx + 1}
                                        </div>
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${step === idx + 1 ? 'text-blue-600' : 'text-gray-500'}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Form Container */}
                <motion.div
                    className="bg-white py-10 px-6 md:px-12 shadow-xl rounded-2xl border border-gray-100"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {step === 1 && <RegisterStep1 onNext={handleStep1Submit} />}
                    {step === 2 && <RegisterStep2 onNext={handleStep2Submit} onBack={() => setStep(1)} />}
                    {step === 3 && <RegisterStep3 onNext={handleStep3Submit} onBack={() => setStep(2)} />}
                    {step === 4 && (
                        <motion.div
                            className="text-center py-12"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900">Registration Submitted!</h3>
                            <p className="mt-3 text-lg text-gray-600 max-w-md mx-auto">
                                Your application is now under review by our validators. You will be notified once approved.
                            </p>
                            <div className="mt-8">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="inline-flex justify-center py-3 px-8 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Footer Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
