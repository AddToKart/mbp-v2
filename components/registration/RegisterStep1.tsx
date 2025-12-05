"use client";

import { useState } from "react";
import { RegisterStep1Schema, type RegisterStep1Request } from "@/types/shared";
import { z } from "zod";
import { motion } from "@/lib/motion";

interface RegisterStep1Props {
    onNext: (data: RegisterStep1Request) => void;
    initialData?: Partial<RegisterStep1Request>;
}

export default function RegisterStep1({ onNext, initialData }: RegisterStep1Props) {
    const [formData, setFormData] = useState<Partial<RegisterStep1Request>>(
        initialData || {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            dob: "",
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Validate with Zod
            const validData = RegisterStep1Schema.parse(formData);
            await onNext(validData);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(fieldErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
    const labelClasses = "block text-sm font-medium text-gray-700";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
                <p className="mt-2 text-gray-600">
                    Please provide your details to create your citizen account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="firstName" className={labelClasses}>
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Juan"
                        />
                        {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label htmlFor="middleName" className={labelClasses}>
                            Middle Name
                        </label>
                        <input
                            type="text"
                            id="middleName"
                            name="middleName"
                            value={formData.middleName || ""}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="Santos"
                        />
                        {errors.middleName && <p className="mt-1 text-sm text-red-600">{errors.middleName}</p>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className={labelClasses}>
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="dela Cruz"
                        />
                        {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                </div>

                {/* Email & Password Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className={labelClasses}>
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="juan@example.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClasses}>
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                    </div>
                </div>

                {/* Phone & DOB Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className={labelClasses}>
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="0912 345 6789"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    <div>
                        <label htmlFor="dob" className={labelClasses}>
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="dob"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                        {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                    </div>
                </div>

                {/* Address - Full Width */}
                <div>
                    <label htmlFor="address" className={labelClasses}>
                        Complete Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="#123 Street Name, Brgy. Poblacion, Santa Maria, Bulacan"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Creating Account...
                        </span>
                    ) : (
                        "Next: Verify Identity →"
                    )}
                </button>
            </form>
        </motion.div>
    );
}
