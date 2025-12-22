"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterStep1Schema, type RegisterStep1Request } from "@/types/shared";
import { motion } from "@/lib/motion";

interface RegisterStep1Props {
    onNext: (data: RegisterStep1Request) => void;
    initialData?: Partial<RegisterStep1Request>;
}

export default function RegisterStep1({ onNext, initialData }: RegisterStep1Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterStep1Request>({
        resolver: zodResolver(RegisterStep1Schema),
        defaultValues: {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            dob: "",
            ...initialData,
        },
    });

    const onSubmit = async (data: RegisterStep1Request) => {
        await onNext(data);
    };

    const inputClasses = "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
    const labelClasses = "block text-sm font-medium text-gray-700";
    const errorClasses = "mt-1 text-sm text-red-600";

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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="firstName" className={labelClasses}>
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            {...register("firstName")}
                            className={inputClasses}
                            placeholder="Juan"
                        />
                        {errors.firstName && <p className={errorClasses}>{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="middleName" className={labelClasses}>
                            Middle Name
                        </label>
                        <input
                            type="text"
                            id="middleName"
                            {...register("middleName")}
                            className={inputClasses}
                            placeholder="Santos"
                        />
                        {errors.middleName && <p className={errorClasses}>{errors.middleName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className={labelClasses}>
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            {...register("lastName")}
                            className={inputClasses}
                            placeholder="dela Cruz"
                        />
                        {errors.lastName && <p className={errorClasses}>{errors.lastName.message}</p>}
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
                            {...register("email")}
                            className={inputClasses}
                            placeholder="juan@example.com"
                        />
                        {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClasses}>
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...register("password")}
                            className={inputClasses}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className={errorClasses}>{errors.password.message}</p>}
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
                            {...register("phone")}
                            className={inputClasses}
                            placeholder="0912 345 6789"
                        />
                        {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="dob" className={labelClasses}>
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="dob"
                            {...register("dob")}
                            className={inputClasses}
                        />
                        {errors.dob && <p className={errorClasses}>{errors.dob.message}</p>}
                    </div>
                </div>

                {/* Address - Full Width */}
                <div>
                    <label htmlFor="address" className={labelClasses}>
                        Complete Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="address"
                        rows={2}
                        {...register("address")}
                        className={inputClasses}
                        placeholder="#123 Street Name, Brgy. Poblacion, Santa Maria, Bulacan"
                    />
                    {errors.address && <p className={errorClasses}>{errors.address.message}</p>}
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
